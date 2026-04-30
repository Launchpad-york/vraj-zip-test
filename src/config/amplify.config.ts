import { Amplify } from "aws-amplify";

const awsConfig = {
	Auth: {
		Cognito: {
			userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
			userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
		},
	},
};

export function configureAmplify() {
	Amplify.configure(awsConfig);
}
