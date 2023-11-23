import { CognitoUserSession } from 'amazon-cognito-identity-js';

interface CustomAuthenticationOptions {
    metaData?: object;
    attestationOptions?: {
        requireResidentKey?: boolean;
        overrideTimeout?: number;
    };
}

/**
 * LoginIDCognitoWebSDK class provides methods for adding and signing in with a passkey using FIDO2 operations.
 */
declare class LoginIDCognitoWebSDK {
    private cognito;
    /**
     * Constructor for the LoginIDCognitoWebSDK class.
     *
     * @param {string} userPoolId - The ID of the Cognito User Pool.
     * @param {string} clientId - The client ID associated with the User Pool.
     */
    constructor(userPoolId: string, clientId: string);
    /**
     * Adds a passkey for the specified username using FIDO2 create operation.
     *
     * @param {string} username - The username of the Cognito user.
     * @param {string} idToken - The ID token associated with the user.
     * @param {CustomAuthenticationOptions} options - Additional options for custom authentication.
     * @returns {Promise<CognitoUserSession>} - A promise resolving to the Cognito user session.
     */
    addPasskey(username: string, idToken: string, options?: CustomAuthenticationOptions): Promise<CognitoUserSession>;
    /**
     * Signs in with a passkey for the specified username using FIDO2 get operation.
     *
     * @param {string} username - The username of the Cognito user.
     * @param {CustomAuthenticationOptions} options - Additional options for custom authentication.
     * @returns {Promise<CognitoUserSession>} - A promise resolving to the Cognito user session.
     */
    signInPasskey(username: string, options?: CustomAuthenticationOptions): Promise<CognitoUserSession>;
}

export { type CustomAuthenticationOptions, LoginIDCognitoWebSDK as default };
