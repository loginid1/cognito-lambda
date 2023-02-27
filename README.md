# loginid-cognito-lambda

An integration of Loginid and AWS Cognito authentication with custom authentication Lambdas.

## Requirements

- Python (Backend)
- NodeJS (Frontend)
- Cognito User Pool
- Loginid Admin Account

## Features

- Register Password
- Register FIDO2
- Login Password
- Login FIDO2
- Add Mulitple FIDO2 Credentials
- Add FIDO2 to Exisiting Password User

## Installation

```
git clone git@gitlab.com:loginid/software/examples/loginid-cognito-lambda.git
cd loginid-cognito-lambda
```

## LoginID Set-Up

Your going to need a confidential backend client.

1. Head over to https://playground.loginid.io and login into your account.
2. Click on `Add Application` and create a `Backend` client.

![Backend Client](./images/choose-client.jpg)

3. Fill out the name of the application (could be anything) and the website URL. This is where your application is currently hosted. If working in development under `localhost`, then entering `http://localhost` is a valid value. You would have to create a seperate client for every different host domain. Click `Create`.

![Backend Info](./images/backend-info.jpg)

4. Once your client is created take note of the `Client ID`. Click `Next Step`.
5. You are going to attach an API credential to this client now with one of the options currently provided. If you have an existing API credential you can attach that as well. In this example, I will click `Generate key pair for me` and let LoginID to create an `ES256` keypair, attach the API credential, and send the private key to me. Store this private key as it will be used to sign service tokens (Bearer authorization tokens) and will be needed to make management API calls.

![Private Key](./images/private-key.jpg)

6. Go to `Settings` on the left hand side and take note of the `Base API URL`.

![Base URL](./images/base-url.jpg)

From here you should have the following needed values:

- Directweb Base URL
- Backend Client ID
- ES256 Private Key

## Cognito Set-Up

- coming soon

## Environment Variables

- coming soon

## How to Run

### Backend

Open up a terminal and enter root of project. This setup will use a virtual environment. You can use whatever suites you.

```
python -m venv venv
source ./venv/.bin/activate
pip install requirements.txt
flask run
```

### Backend

Open up a terminal and enter root of project. This setup will use a virtual environment. You can use whatever suites you.

```
python -m venv venv
source ./venv/.bin/activate
pip install requirements.txt
flask run
```

### Frontend

Open up a terminal and enter root of project.

```
npm install
npm run dev
```
