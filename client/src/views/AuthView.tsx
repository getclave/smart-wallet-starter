'use client';
import { sdk } from '@/sdk';
import { useSetCredential } from '@/store';
import { Storage, StorageKeys } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { FaArrowCircleRight, FaUserPlus } from 'react-icons/fa';
import { TailSpin } from 'react-loading-icons';

type BoxProps = {
    onPress: () => void;
    title: string;
    text: string;
    icon: ReactNode;
    isPending?: boolean;
};
export const AuthView = () => {
    const setCredentials = useSetCredential();

    const deployAccount = async () => {
        // Prepare unique salt
        const salt = sdk.deployer.getSalt();

        // Calculate the smart account address
        const publicAddress = await sdk.deployer.getAddressForSalt(salt);

        // Create passkey
        const passkey = await sdk.webauthn.register(publicAddress);

        // Extract p256 public key from the passkey
        const publicKey = sdk.webauthn.getPublicKeyFromAuthenticatorData(
            passkey.authenticatorData,
        );

        // Make deployment call: If status == 1, deployment is successful
        const { status } = await sdk.deployer.deploy(salt, publicKey);

        if (status === 1) {
            const credential = {
                credentialId: passkey.id,
                publicAddress,
            };
            setCredentials(credential);
            sdk.core.connect(credential);
            Storage.setJsonItem(StorageKeys.credential, credential);
        } else {
            throw new Error('Deployment failed');
        }
    };

    const deployMutation = useMutation({
        mutationFn: deployAccount,
    });

    const loginAccount = async () => {
        const passkey = await sdk.webauthn.login();
        const credential = {
            credentialId: passkey.id,
            publicAddress: passkey.response.userHandle,
        };
        setCredentials(credential);
        Storage.setJsonItem(StorageKeys.credential, credential);
        sdk.core.connect(credential);
    };

    const loginMutation = useMutation({
        mutationFn: loginAccount,
    });

    return (
        <div className="flex flex-1 justify-center items-center">
            <div className="container bg-slate-900 border-2 border-slate-800 w-[512px] min-h-[512px] max-w-[95vw] rounded-lg p-8 overflow-hidden">
                <p className="text-2xl text-white text-center mb-4">
                    ZKsync Smart Wallet Demo
                </p>
                <div className="space-y-4">
                    <Box
                        onPress={async () => {
                            await deployMutation.mutateAsync();
                        }}
                        icon={<FaUserPlus className="mr-2" size={32} />}
                        title="Create Smart Wallet"
                        text=" Start deploying your Smart Wallet on ZKsync"
                        isPending={deployMutation.isPending}
                    />

                    <Box
                        onPress={async () => {
                            await loginMutation.mutateAsync();
                        }}
                        icon={<FaArrowCircleRight className="mr-2" size={32} />}
                        title="Login Existing Wallet"
                        text={`Start using your existing Smart Wallet on ZKsync`}
                        isPending={loginMutation.isPending}
                    />
                </div>

                <p className="text-center text-white mt-4">
                    🩵 Made with one mission: to accelerate the onboarding of the
                    next billion to crypto.
                </p>
            </div>
        </div>
    );
};

const Box = ({
    onPress,
    title,
    text,
    icon,
    isPending = false,
}: BoxProps): ReactNode => {
    return (
        <button
            onClick={onPress}
            className="text-white flex flex-col items-center justify-center bg-slate-950 p-4 rounded-lg w-full border-2 border-slate-800 focus:border-blue-600 min-h-[180px]"
        >
            {isPending ? (
                <TailSpin speed={0.75} width={32} height={32} />
            ) : (
                icon
            )}
            <p className="text-xl mt-2">{title}</p>
            <p className="text-sm mt-2 text-gray-400">{text}</p>
        </button>
    );
};
