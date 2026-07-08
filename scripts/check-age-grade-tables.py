#!/usr/bin/env python3
"""
Verifies src/lib/utils/parkrun.ts's hardcoded WMA/Alan Jones 5K age-grading
tables against the live source at:
https://github.com/AlanLyttonJones/Age-Grade-Tables

Written in Python (unlike the rest of scripts/, which is Node) because xlsx
files are just zipped XML, so the stdlib (zipfile + xml.etree) can read them
directly with no dependency to install. Run via .github/workflows/check-age-grade-tables.yml
on a quarterly schedule, or manually with: python3 scripts/check-age-grade-tables.py

Exits non-zero (with a diagnostic printed to stdout) if:
  - the male or female age-factor table has drifted from the live source,
  - the open-class (OC) standard seconds have changed,
  - the source spreadsheet's version string no longer matches what's recorded
    in parkrun.ts's source comment, or
  - a newer standards revision (e.g. a "2026 Files" / "2030 Files" directory)
    has appeared in the repo alongside/instead of "2025 Files".
"""
import re
import sys
import json
import zipfile
import urllib.request
import io
from xml.etree import ElementTree as ET

REPO = "AlanLyttonJones/Age-Grade-Tables"
STANDARDS_DIR = "2025 Files"  # bump this (and PARKRUN_TS's source comment) if a newer dir appears
MALE_FILE = "MaleRoadStd2025.xlsx"
FEMALE_FILE = "FemaleRoadStd2025.xlsx"
PARKRUN_TS = "src/lib/utils/parkrun.ts"

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_to_idx(cell_ref):
	letters = re.match(r"([A-Z]+)", cell_ref).group(1)
	idx = 0
	for ch in letters:
		idx = idx * 26 + (ord(ch) - ord("A") + 1)
	return idx - 1


def load_shared_strings(z):
	try:
		data = z.read("xl/sharedStrings.xml")
	except KeyError:
		return []
	root = ET.fromstring(data)
	strings = []
	for si in root.findall("a:si", NS):
		texts = si.findall(".//a:t", NS)
		strings.append("".join(t.text or "" for t in texts))
	return strings


def load_sheet(z, sheet_path, shared):
	data = z.read(sheet_path)
	root = ET.fromstring(data)
	rows = {}
	for row in root.findall(".//a:sheetData/a:row", NS):
		r = int(row.get("r"))
		cells = {}
		for c in row.findall("a:c", NS):
			idx = col_to_idx(c.get("r"))
			t = c.get("t")
			v_el = c.find("a:v", NS)
			if v_el is None:
				continue
			v = v_el.text
			if t == "s":
				v = shared[int(v)]
			cells[idx] = v
		rows[r] = cells
	return rows


def fetch(url):
	req = urllib.request.Request(url, headers={"User-Agent": "runwise-age-grade-check"})
	with urllib.request.urlopen(req, timeout=30) as resp:
		return resp.read()


def extract_table(xlsx_bytes, km5_col):
	with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as z:
		shared = load_shared_strings(z)
		rows = load_sheet(z, "xl/worksheets/sheet1.xml", shared)
	version = rows[1].get(0, "")
	oc_seconds = float(rows[4][km5_col])
	factors = {}
	for age in range(5, 101):
		r = age + 1
		v = rows.get(r, {}).get(km5_col)
		if v is not None:
			factors[age] = round(float(v), 4)
	return version, oc_seconds, factors


def parse_parkrun_ts(path):
	src = open(path).read()

	version_match = re.search(r'Version\s+([\d-]+)', src)
	recorded_version = version_match.group(1) if version_match else None

	def extract_ts_table(gender):
		m = re.search(gender + r":\s*\{(.*?)\n\t\}", src, re.S)
		pairs = re.findall(r"(\d+):\s*([\d.]+)", m.group(1))
		return {int(k): float(v) for k, v in pairs}

	oc_match = re.search(r"OC_SECONDS.*?male:\s*(\d+),\s*female:\s*(\d+)", src, re.S)
	oc_male, oc_female = (float(oc_match.group(1)), float(oc_match.group(2)))

	return recorded_version, oc_male, oc_female, extract_ts_table("male"), extract_ts_table("female")


def diff_tables(name, hc, live, tolerance=0.0005):
	problems = []
	ages = sorted(set(hc) | set(live))
	for age in ages:
		h, o = hc.get(age), live.get(age)
		if h is None or o is None:
			problems.append(f"  age {age}: missing (hardcoded={h}, live={o})")
		elif abs(h - o) > tolerance:
			problems.append(f"  age {age}: hardcoded={h} live={o} (diff={round(h - o, 4)})")
	if problems:
		print(f"[MISMATCH] {name} table has drifted from the live source ({len(problems)} ages):")
		print("\n".join(problems[:20]))
		if len(problems) > 20:
			print(f"  ... and {len(problems) - 20} more")
	return problems


def check_for_newer_standards_dir():
	data = fetch(f"https://api.github.com/repos/{REPO}/contents/")
	entries = json.loads(data)
	dirs = [e["name"] for e in entries if e["type"] == "dir" and re.match(r"20\d\d Files", e["name"])]
	current_year = int(re.match(r"(\d+)", STANDARDS_DIR).group(1))
	newer = [d for d in dirs if int(re.match(r"(\d+)", d).group(1)) > current_year]
	return newer


def main():
	problems_found = False

	recorded_version, ts_oc_male, ts_oc_female, ts_male, ts_female = parse_parkrun_ts(PARKRUN_TS)

	male_bytes = fetch(f"https://raw.githubusercontent.com/{REPO}/master/{STANDARDS_DIR.replace(' ', '%20')}/{MALE_FILE}")
	female_bytes = fetch(f"https://raw.githubusercontent.com/{REPO}/master/{STANDARDS_DIR.replace(' ', '%20')}/{FEMALE_FILE}")

	male_version, male_oc, male_factors = extract_table(male_bytes, km5_col=2)
	female_version, female_oc, female_factors = extract_table(female_bytes, km5_col=3)

	if recorded_version and recorded_version not in male_version:
		print(f"[VERSION CHANGED] parkrun.ts records \"{recorded_version}\", live male file says: \"{male_version}\"")
		problems_found = True

	if ts_oc_male != male_oc:
		print(f"[OC MISMATCH] male OC_SECONDS: hardcoded={ts_oc_male}, live={male_oc}")
		problems_found = True
	if ts_oc_female != female_oc:
		print(f"[OC MISMATCH] female OC_SECONDS: hardcoded={ts_oc_female}, live={female_oc}")
		problems_found = True

	if diff_tables("male", ts_male, male_factors):
		problems_found = True
	if diff_tables("female", ts_female, female_factors):
		problems_found = True

	newer_dirs = check_for_newer_standards_dir()
	if newer_dirs:
		print(f"[NEW STANDARDS] Found newer standards director{'y' if len(newer_dirs) == 1 else 'ies'} in the "
			  f"source repo beyond \"{STANDARDS_DIR}\": {', '.join(newer_dirs)}. "
			  f"A full revision may have been published — worth reviewing even if the current tables still match.")
		problems_found = True

	if not problems_found:
		print(f"OK — parkrun.ts's age-grade tables match the live source ({male_version}).")
		return 0

	print("\nSee https://github.com/AlanLyttonJones/Age-Grade-Tables for the source spreadsheets.")
	return 1


if __name__ == "__main__":
	sys.exit(main())
