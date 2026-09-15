import type { ExplainerSection } from '../explainers';

export interface GuideContent {
	slug: string;
	route: string;
	title: string;
	excerpt: string;
	sourcesCredited: string[];
	intro: string;
	sections: ExplainerSection[];
}
