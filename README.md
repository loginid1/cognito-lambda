# loginid-cognito-lambda

An integration of Loginid and AWS Cognito authentication with custom authentication Lambdas.

## Requirements

- NodeJS (Frontend)
- Cognito User Pool
- AWS service
- Loginid Admin Account

## Features

- Register Password
- Register FIDO2
- Login Password
- Login FIDO2
- Add Mulitple FIDO2 Credentials
- Add FIDO2 to Exisiting Password User

## LoginID Set-Up

You need to the following items with LoginID in order to run this integration:

- Web Tenant (Non-OIDC) base URL
- Tenant level ES256 private key needed to call backend services

Here are some general steps:

1. Head over to https://dashboard.gen2.playground.loginid.io and login into your account.
2. Click on `Create Tenant`.
3. Make sure `Non OIDC` tenant is selected.
4. Enter a name for your tenant on the `Tenant Name` field.
5. Enter the `RPID (Relying Party ID)` value of your hosted application. The demo will be running on localhost so enter `localhost` here.
6. Enter the `Allowed Origins` URL of your hosted application. The origin of the demo is `http://localhost:1234` so enter `http://localhost:1234` here.
7. Click on the Advanced `Configuration` tab and click the `Generate Key Pair` button - store the `private key` that gets generated
   This will create a ES256 key pair where the public key is stored with LoginID and the private key will be shown here once. Copy the PEM formatted private key as it will be needed later.
8. Finish creating your tenant and copy the `base URL`.

From here you should have the following needed values:

- Tenant Base URL
- ES256 Private Key

#### Note on RPIDs

The RPID is a unique identifier that represents a relying party in the WebAuthn (Web Authentication) system. The RPID will be the host part of where your application is hosted. For example if your development application is hosted on:

http://**localhost**:3000

The RPID will be **localhost**. The bolded text are also valid RPIDs for the following examples:

- https://**example**.com
- https://**subdomain.example**.com

WebAuthn relies on this identifier to associate authentication requests and responses with the correct relying party, ensuring secure and accurate authentication.

#### Note on Allowed Origins

Allowed origins are specific web domains or URLs permitted to make cross-origin requests to a web server. In the context of WebAuthn, these origins are crucial for security.

If left blank, the value will default to the base URL of the RPID value. You only need to enter the origin of your application if you are dealing with `port numbers` or `subdomains`. For instance, if your application is hosted at `http://localhost:3000`, enter that URL here, as the port number is a required component.

This ensures that only requests from `http://localhost:3000` are accepted for WebAuthn operations, adding an extra layer of security to the authentication process.

## Cognito Set-Up

Running the [CloudFormation](https://aws.amazon.com/cloudformation/) found in `./aws/TemplateAPI.yaml` will set up the services and the backend needed to run this demo. When the template is finished running, the output will produce three values:

1. PasskeyAPIEndpoint - The backend base URL for the demo
2. UserPoolId - Cognito userpool ID
3. UserPoolClientId - public Cognito client ID

Enter the required parameters when running the template:

1. `LOGINIDBaseURL` - The Tenant base URL from LoginID
2. `LOGINIDPrivateKey` - The ES256 private key from LoginID

When entering the private key, replace the newlines with the `\n` characters. For example:

```
-----BEGIN PRIVATE KEY-----\nMIG...GMT/gj\n-----END PRIVATE KEY-----
```

Running the template will create and configure the settings for the following services:

1. Secrets Manager
2. Cognito User Pool
3. Cognito Public Client
4. DefineAuthChallenge Lambda
5. CreateAuthChallenge Lambda
6. VerifyAuthChallenge Lambda
7. API Gateway Proxy
8. Rest API Lambda

The `Secrets Manager` service is needed to securely store the ES256 private key that was provided from LoginID.

You can delete the CloudFormation stack once you are done with the demo.

When you run the template located at `./aws/Template.yaml`, it will configure all the necessary services (not including API Gateway and Rest API Lambda) to create a Cognito User Pool with customized authentication for passkeys. It's recommended to use this template outside of the demo if you wish to set up a new user pool.

## Demo Set-Up

After completing the execution of the [CloudFormation template](#cognito-set-up), please proceed by adding the following environment variables to an `.env` file with the outputted variables:

```
REACT_PASSKEY_API_BASE_URL=<PasskeyAPIEndpoint>
REACT_COGNITO_USER_POOL_ID=<UserPoolId>
REACT_COGNITO_CLIENT_ID=<UserPoolClientId>
```

## Running Demo

Install the npm packages:

```
npm install
```

Run the demo:

```
npm run dev
```

If you would like to use Docker instead, enter the following commands:

```
docker build -t loginid-cognito .
docker run -p 1234:1234 -v "$(pwd):/usr/src/app" loginid-cognito
```
