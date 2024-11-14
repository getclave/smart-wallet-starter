'use client';

import { sdk } from '@/sdk';
import { Credential, useSetCredential } from '@/store';
import { Storage, StorageKeys } from '@/utils';
import { useEffect } from 'react';

export const StateSetter = () => {
    const setCredential = useSetCredential();

    useEffect(() => {
        const credetential = Storage.getJsonItem<Credential>(
            StorageKeys.credential,
        );
        if (credetential) {
            setCredential(credetential);
            sdk.core.connect(credetential);
        }
    }, [setCredential]);

    return null;
};
