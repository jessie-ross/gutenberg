/**
 * WordPress dependencies
 */
import {
	createNewPost,
	clickOnMoreMenuItem,
	toggleMoreMenu,
} from '@wordpress/e2e-test-utils';

describe( 'Fullscreen Mode', () => {
	beforeAll( async () => {
		await createNewPost();
	} );

	it( 'should open the fullscreen mode from the more menu', async () => {
		await clickOnMoreMenuItem( 'Fullscreen mode' );
		await toggleMoreMenu();

		const isFullscreenEnabled = await page.$eval( 'body', ( body ) => {
			return body.classList.contains( 'is-fullscreen-mode' );
		} );

		expect( isFullscreenEnabled ).toBe( true );

		const fullscreenAdminMenuToggle = await page.$(
			'.edit-post-fullscreen-admin-menu-toggle'
		);

		expect( fullscreenAdminMenuToggle ).not.toBeNull();
	} );
} );
