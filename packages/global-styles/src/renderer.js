/**
 * WordPress dependencies
 */
import { useEffect, useLayoutEffect } from '@wordpress/element';

/**
 * TODO: Replace everything below with client-side style rendering mechanism
 */

export function useRenderedGlobalStyles( styles = {} ) {
	useGlobalStylesEnvironment();
	const generatedStyles = compileStyles( styles );

	useEffect( () => {
		const styleNodeId = 'wp-global-styles-tag';
		let styleNode = document.getElementById( styleNodeId );

		if ( ! styleNode ) {
			styleNode = document.createElement( 'style' );
			styleNode.id = styleNodeId;
			document
				.getElementsByTagName( 'head' )[ 0 ]
				.appendChild( styleNode );
		}

		styleNode.innerText = generatedStyles;
	}, [ generatedStyles ] );
}

function useGlobalStylesEnvironment() {
	useLayoutEffect( () => {
		// Adding a slight async delay to give the Gutenberg editor time to render.
		window.requestAnimationFrame( () => {
			// Getting the Gutenberg editor content wrapper DOM node.
			const editorNode = document.getElementsByClassName(
				'editor-styles-wrapper'
			)[ 0 ];

			if ( ! editorNode.classList.contains( 'wp-gs' ) ) {
				editorNode.classList.add( 'wp-gs' );
				document.body.classList.remove( 'wp-gs' );
			} else {
				document.body.classList.add( 'wp-gs' );
			}
			document.body.classList.remove( 'wp-gs' );
		} );
	}, [] );
}

function convertToUnitValue( key, value ) {
	const units = {
		textLetterSpacing: 'px',
		textFontSize: 'px',
	};
	if ( units[ key ] ) {
		return `${ value }${ units[ key ] }`;
	}
	return value;
}

function flattenStyles( ob ) {
	const toReturn = {};

	for ( const i in ob ) {
		if ( ! ob.hasOwnProperty( i ) ) continue;

		if ( typeof ob[ i ] === 'object' ) {
			const flatObject = flattenStyles( ob[ i ] );
			for ( const x in flatObject ) {
				if ( ! flatObject.hasOwnProperty( x ) ) continue;
				const v = flatObject[ x ];
				toReturn[ i + '.' + x ] = convertToUnitValue( x, v );
			}
		} else {
			toReturn[ i ] = ob[ i ];
		}
	}
	return toReturn;
}

function getFlattenedStyles( styles = {} ) {
	const flattenedStyles = { ...flattenStyles( styles ) };
	const nextStyles = {};

	for ( const key in flattenedStyles ) {
		const value = flattenedStyles[ key ];
		if ( key.includes( 'global.' ) ) {
			nextStyles[ key.replace( 'global.', '' ) ] = value;
		} else {
			nextStyles[ key.replace( '/', '-' ) ] = value;
		}
	}

	return nextStyles;
}

function compileStyles( styles = {} ) {
	const html = [];
	const flattenedStyles = getFlattenedStyles( styles );
	html.push( ':root {' );

	for ( const key in flattenedStyles ) {
		const value = flattenedStyles[ key ];
		if ( value ) {
			const style = `--wp--${ key.replace( /\./g, '--' ) }: ${ value };`;
			html.push( style );
		}
	}
	html.push( '}' );

	html.push(
		'.editor-styles-wrapper { background-color: var(--wp--color--background); }'
	);

	return html.join( '\n' );
}