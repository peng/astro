import type { SSRElement, AssetsPrefix } from '../../@types/astro.js';
import { joinPaths, prependForwardSlash, slash } from '../../core/path.js';
import type { StylesheetAsset } from '../app/types.js';
import { getFileExtension } from '@astrojs/internal-helpers/path';

export function createAssetLink(href: string, base?: string, assetsPrefix?: AssetsPrefix): string {
	if (typeof assetsPrefix === "string") {
		return joinPaths(assetsPrefix, slash(href));
	} else if (typeof assetsPrefix === "function") {
		const fileType = getFileExtension(href)
		const pf = assetsPrefix(fileType) || ""
		return joinPaths(pf, slash(href));
	} else if (base) {
		return prependForwardSlash(joinPaths(base, slash(href)));
	} else {
		return href;
	}
}

export function createStylesheetElement(
	stylesheet: StylesheetAsset,
	base?: string,
	assetsPrefix?: AssetsPrefix
): SSRElement {
	if (stylesheet.type === 'inline') {
		return {
			props: {},
			children: stylesheet.content,
		};
	} else {
		return {
			props: {
				rel: 'stylesheet',
				href: createAssetLink(stylesheet.src, base, assetsPrefix),
			},
			children: '',
		};
	}
}

export function createStylesheetElementSet(
	stylesheets: StylesheetAsset[],
	base?: string,
	assetsPrefix?: AssetsPrefix
): Set<SSRElement> {
	return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}

export function createModuleScriptElement(
	script: { type: 'inline' | 'external'; value: string },
	base?: string,
	assetsPrefix?: AssetsPrefix
): SSRElement {
	if (script.type === 'external') {
		return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
	} else {
		return {
			props: {
				type: 'module',
			},
			children: script.value,
		};
	}
}

export function createModuleScriptElementWithSrc(
	src: string,
	base?: string,
	assetsPrefix?: AssetsPrefix
): SSRElement {
	return {
		props: {
			type: 'module',
			src: createAssetLink(src, base, assetsPrefix),
		},
		children: '',
	};
}

export function createModuleScriptElementWithSrcSet(
	srces: string[],
	site?: string,
	assetsPrefix?: AssetsPrefix
): Set<SSRElement> {
	return new Set<SSRElement>(
		srces.map((src) => createModuleScriptElementWithSrc(src, site, assetsPrefix))
	);
}

export function createModuleScriptsSet(
	scripts: { type: 'inline' | 'external'; value: string }[],
	base?: string,
	assetsPrefix?: AssetsPrefix
): Set<SSRElement> {
	return new Set<SSRElement>(
		scripts.map((script) => createModuleScriptElement(script, base, assetsPrefix))
	);
}
