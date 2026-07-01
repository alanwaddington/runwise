import { describe, it, expect } from 'vitest';
import {
	getFitnessCategory,
	getAcsmTable,
	CATEGORY_COLOURS,
	CATEGORIES
} from './vo2max';

// ─── CATEGORIES constant ─────────────────────────────────────────────────────

describe('CATEGORIES', () => {
	it('CATEGORIES_HasSixLevels', () => {
		expect(CATEGORIES).toHaveLength(6);
	});

	it('CATEGORIES_OrderedFromSuperiorToVeryPoor', () => {
		expect(CATEGORIES[0]).toBe('Superior');
		expect(CATEGORIES[5]).toBe('Very Poor');
	});
});

// ─── CATEGORY_COLOURS ────────────────────────────────────────────────────────

describe('CATEGORY_COLOURS', () => {
	it('CATEGORY_COLOURS_HasEntryForAllCategories', () => {
		expect(CATEGORY_COLOURS['Superior']).toBeTruthy();
		expect(CATEGORY_COLOURS['Excellent']).toBeTruthy();
		expect(CATEGORY_COLOURS['Good']).toBeTruthy();
		expect(CATEGORY_COLOURS['Fair']).toBeTruthy();
		expect(CATEGORY_COLOURS['Poor']).toBeTruthy();
		expect(CATEGORY_COLOURS['Very Poor']).toBeTruthy();
	});
});

// ─── getAcsmTable ────────────────────────────────────────────────────────────

describe('getAcsmTable', () => {
	it('getAcsmTable_ReturnsSixBrackets', () => {
		expect(getAcsmTable()).toHaveLength(6);
	});

	it('getAcsmTable_FirstBracketIs2029', () => {
		const table = getAcsmTable();
		expect(table[0].label).toBe('20-29');
	});

	it('getAcsmTable_LastBracketIs7079', () => {
		const table = getAcsmTable();
		expect(table[5].label).toBe('70-79');
	});

	it('getAcsmTable_EachBracketHasMaleAndFemaleThresholds', () => {
		const table = getAcsmTable();
		for (const bracket of table) {
			expect(bracket.male).toBeDefined();
			expect(bracket.female).toBeDefined();
			expect(bracket.male.superior).toBeGreaterThan(0);
			expect(bracket.female.superior).toBeGreaterThan(0);
		}
	});

	it('getAcsmTable_MaleSuperiorThresholdsDeclineWithAge', () => {
		const table = getAcsmTable();
		expect(table[0].male.superior).toBeGreaterThan(table[5].male.superior);
	});
});

// ─── getFitnessCategory ──────────────────────────────────────────────────────

describe('getFitnessCategory', () => {
	// ── Missing age/gender returns null ──────────────────────────────────────

	it('getFitnessCategory_NoAge_ReturnsNull', () => {
		expect(getFitnessCategory(40)).toBeNull();
	});

	it('getFitnessCategory_AgeButNoGender_ReturnsNull', () => {
		expect(getFitnessCategory(40, 35, undefined)).toBeNull();
	});

	it('getFitnessCategory_GenderButNoAge_ReturnsNull', () => {
		expect(getFitnessCategory(40, undefined, 'male')).toBeNull();
	});

	// ── Age validation ───────────────────────────────────────────────────────

	it('getFitnessCategory_AgeTooLow_ReturnsNull', () => {
		expect(getFitnessCategory(40, 9, 'male')).toBeNull();
	});

	it('getFitnessCategory_AgeTooHigh_ReturnsNull', () => {
		expect(getFitnessCategory(40, 101, 'male')).toBeNull();
	});

	it('getFitnessCategory_BoundaryAge10_ReturnsResult', () => {
		expect(getFitnessCategory(40, 10, 'male')).not.toBeNull();
	});

	it('getFitnessCategory_BoundaryAge100_ReturnsResult', () => {
		expect(getFitnessCategory(40, 100, 'male')).not.toBeNull();
	});

	// ── Bracket mapping ──────────────────────────────────────────────────────

	it('getFitnessCategory_Age25_MapsToBracket2029', () => {
		const result = getFitnessCategory(40, 25, 'male');
		expect(result!.bracket).toBe('20-29');
		expect(result!.isApproximate).toBe(false);
	});

	it('getFitnessCategory_Age35_MapsToBracket3039', () => {
		const result = getFitnessCategory(40, 35, 'male');
		expect(result!.bracket).toBe('30-39');
		expect(result!.isApproximate).toBe(false);
	});

	it('getFitnessCategory_Age45_MapsToBracket4049', () => {
		const result = getFitnessCategory(40, 45, 'male');
		expect(result!.bracket).toBe('40-49');
		expect(result!.isApproximate).toBe(false);
	});

	it('getFitnessCategory_Age55_MapsToBracket5059', () => {
		const result = getFitnessCategory(40, 55, 'male');
		expect(result!.bracket).toBe('50-59');
		expect(result!.isApproximate).toBe(false);
	});

	it('getFitnessCategory_Age65_MapsToBracket6069', () => {
		const result = getFitnessCategory(40, 65, 'male');
		expect(result!.bracket).toBe('60-69');
		expect(result!.isApproximate).toBe(false);
	});

	it('getFitnessCategory_Age75_MapsToBracket7079', () => {
		const result = getFitnessCategory(40, 75, 'male');
		expect(result!.bracket).toBe('70-79');
		expect(result!.isApproximate).toBe(false);
	});

	// ── Out-of-bracket age mapping (approximate) ─────────────────────────────

	it('getFitnessCategory_Age18_MapsToBracket2029WithApproximate', () => {
		const result = getFitnessCategory(40, 18, 'male');
		expect(result!.bracket).toBe('20-29');
		expect(result!.isApproximate).toBe(true);
	});

	it('getFitnessCategory_Age10_MapsToBracket2029WithApproximate', () => {
		const result = getFitnessCategory(40, 10, 'male');
		expect(result!.bracket).toBe('20-29');
		expect(result!.isApproximate).toBe(true);
	});

	it('getFitnessCategory_Age80_MapsToBracket7079WithApproximate', () => {
		const result = getFitnessCategory(40, 80, 'male');
		expect(result!.bracket).toBe('70-79');
		expect(result!.isApproximate).toBe(true);
	});

	it('getFitnessCategory_Age100_MapsToBracket7079WithApproximate', () => {
		const result = getFitnessCategory(40, 100, 'male');
		expect(result!.bracket).toBe('70-79');
		expect(result!.isApproximate).toBe(true);
	});

	// ── Gender in result ─────────────────────────────────────────────────────

	it('getFitnessCategory_MaleGender_ReturnsGenderMale', () => {
		const result = getFitnessCategory(40, 35, 'male');
		expect(result!.gender).toBe('male');
	});

	it('getFitnessCategory_FemaleGender_ReturnsGenderFemale', () => {
		const result = getFitnessCategory(40, 35, 'female');
		expect(result!.gender).toBe('female');
	});

	// ── Category values for known VDOT inputs ────────────────────────────────

	it('getFitnessCategory_Vdot40Male35_ReturnsFair', () => {
		// ACSM male 30-39: Fair threshold = 35.5, Good threshold = 41.0
		// VDOT 40 is between 35.5 and 41.0 → Fair
		const result = getFitnessCategory(40, 35, 'male');
		expect(result!.category).toBe('Fair');
	});

	it('getFitnessCategory_Vdot50Female25_ReturnsExcellentOrSuperior', () => {
		// ACSM female 20-29: Excellent threshold = 39.5, Superior = 44.2
		// VDOT 50 > 44.2 → Superior
		const result = getFitnessCategory(50, 25, 'female');
		expect(result!.category).toBe('Superior');
	});

	it('getFitnessCategory_Vdot60Male25_ReturnsSuperior', () => {
		// ACSM male 20-29: Superior threshold = 51.4
		// VDOT 60 > 51.4 → Superior
		const result = getFitnessCategory(60, 25, 'male');
		expect(result!.category).toBe('Superior');
	});

	it('getFitnessCategory_Vdot25Male35_ReturnsPoorOrVeryPoor', () => {
		// ACSM male 30-39: Poor threshold = 31.5
		// VDOT 25 < 31.5 → Very Poor
		const result = getFitnessCategory(25, 35, 'male');
		expect(result!.category).toBe('Very Poor');
	});

	it('getFitnessCategory_Vdot32Male35_ReturnsPoor', () => {
		// ACSM male 30-39: Poor = 31.5, Fair = 35.5
		// VDOT 32 is between 31.5 and 35.5 → Poor
		const result = getFitnessCategory(32, 35, 'male');
		expect(result!.category).toBe('Poor');
	});

	it('getFitnessCategory_Vdot45Male35_ReturnsGood', () => {
		// ACSM male 30-39: Good = 41.0, Excellent = 44.6
		// VDOT 45 >= 44.6 → Excellent
		const result = getFitnessCategory(45, 35, 'male');
		expect(result!.category).toBe('Excellent');
	});

	it('getFitnessCategory_Vdot55Female55_ReturnsSuperior', () => {
		// ACSM female 50-59: Superior = 35.2
		// VDOT 55 > 35.2 → Superior
		const result = getFitnessCategory(55, 55, 'female');
		expect(result!.category).toBe('Superior');
	});

	it('getFitnessCategory_BoundaryAtSuperiorThreshold_ReturnsSuperior', () => {
		// ACSM male 20-29: Superior threshold = 51.4
		const result = getFitnessCategory(51.4, 25, 'male');
		expect(result!.category).toBe('Superior');
	});

	it('getFitnessCategory_JustBelowSuperiorThreshold_ReturnsExcellent', () => {
		// ACSM male 20-29: Excellent = 46.8, Superior = 51.4
		const result = getFitnessCategory(46.8, 25, 'male');
		expect(result!.category).toBe('Excellent');
	});
});
