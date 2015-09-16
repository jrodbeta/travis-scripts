import path from 'path';

import pkg from './../../package.json';

import deleteBranch from './../utils/delete-branch';
import get from './../utils/get';
import getTestBranchName from './../utils/get-test-branch-name';
import testBuild from './../utils/test-build';
import travis from './../utils/travis';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const CURRENT_TEST_DIR = path.basename(__dirname);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const customTests = async (tap) => {

    const TEST_TEXT = `${pkg['config']['test-text']}`;

    const TEST_BRANCH_NAME = getTestBranchName(CURRENT_TEST_DIR);

    const TEST_FILE_URL = `https://raw.githubusercontent.com/${travis.getRepositorySlug()}/${TEST_BRANCH_NAME}-dist/file.txt`;
    const TEST_FILE_STATUS_CODE = await get.getStatusCode(TEST_FILE_URL);
    const TEST_FILE_CONTENT = await get.getContent(TEST_FILE_URL);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Test if the test file exists
    tap.equal(200, TEST_FILE_STATUS_CODE, `Test file (${TEST_FILE_URL}) should exist`);

    // Test if the test file has the expected content
    tap.equal(TEST_TEXT, TEST_FILE_CONTENT, `Test file (${TEST_FILE_URL} should contain '${TEST_TEXT}\\n'`);

    // Delete additional branch created by this build
    tap.test('Delete dist branch', async (t) => {

        try {
            await deleteBranch(`${TEST_BRANCH_NAME}-dist`);
            t.pass(`Should delete branch \`${TEST_BRANCH_NAME}-dist\``);
        } catch (e) {
            t.fail(`Should delete branch \`${TEST_BRANCH_NAME}-dist\``);
            t.error(e);
        }

        t.end();

    });

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export default (tap) => {
    testBuild(tap, CURRENT_TEST_DIR, customTests);
};