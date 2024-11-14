'use client';

import { Token, tokens } from '@/constants';
import { sdk } from '@/sdk';
import { Page, useBalances, useSetPage } from '@/store';
import { Queries, queryClient } from '@/utils';
import { mergeClasses } from '@/utils/global';
import { formatBigNumber } from '@asgarovf/smart-wallet-sdk';
import { useMutation } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { useMemo, useState } from 'react';

export const SendView = () => {
    const setPage = useSetPage();
    const [value, setValue] = useState('');
    const [receiver, setReceiver] = useState('');
    const [receiver2, setReceiver2] = useState('');
    const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);
    const balances = useBalances();

    const transfer = async () => {
        const tx = await sdk.core.getBatchTransaction(
            {
                to: receiver,
                value: ethers.utils.parseEther(value),
            },
            {
                to: receiver2,
                value: ethers.utils.parseEther(value),
            },
        );

        await tx.signAndSend();
        queryClient.refetchQueries({ queryKey: [Queries.BALANCES] });
    };

    const transferMutation = useMutation({
        mutationFn: transfer,
        onSettled: () => {
            setValue('');
            setReceiver('');
        },
        onSuccess: () => {
            setPage(Page.HOME);
        },
    });

    const isButtonDisabled = useMemo(() => {
        return (
            value.length === 0 ||
            !ethers.utils.isAddress(receiver) ||
            transferMutation.isPending
        );
    }, [receiver, value, transferMutation.isPending]);

    return (
        <div>
            <div className="flex">
                <h1 className="text-4xl font-semibold">Send</h1>
                <select
                    onChange={(e) => {
                        const address = e.target.value;
                        const token = tokens.find(
                            (item) => item.address === address,
                        );
                        setSelectedToken(token!);
                    }}
                    defaultValue={selectedToken.address}
                    className="ml-auto h-12 bg-transparent border-2 outline-none border-slate-700 rounded-md text-lg px-2"
                >
                    {tokens.map((item) => (
                        <option key={item.address} value={item.address}>
                            {item.symbol} -{' '}
                            {formatBigNumber(
                                balances[item.address],
                                item.decimals,
                            )}{' '}
                            Available
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <div className="mt-4">
                    <span className="inputLabel">Receiver 1</span>
                    <input
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="Enter address"
                        autoFocus
                        value={receiver}
                        className="h-12 w-full mt-2 text-md bg-transparent outline-none caret-slate-300 border-b-2"
                    />
                </div>
                <div className="mt-4">
                    <span className="inputLabel">Receiver 2</span>
                    <input
                        onChange={(e) => setReceiver2(e.target.value)}
                        placeholder="Enter address"
                        autoFocus
                        value={receiver2}
                        className="h-12 w-full mt-2 text-md bg-transparent outline-none caret-slate-300 border-b-2"
                    />
                </div>
                <div className="flex flex-col mt-10  border-b-2">
                    <span className="inputLabel">
                        Amount ({selectedToken.symbol})
                    </span>
                    <input
                        onChange={(e) => {
                            const _value = e.target.value;
                            const commasReplace = _value.replace(/,/g, '.');
                            if (commasReplace === '.') {
                                setValue('0.');
                            } else {
                                if (commasReplace.match(/^[0-9]*\.?[0-9]*$/)) {
                                    setValue(commasReplace);
                                }
                            }
                        }}
                        placeholder="0.00"
                        value={value}
                        className="h-12 rounded-md text-4xl bg-transparent outline-none caret-slate-300 mt-2"
                    />
                </div>
            </div>
            <button
                disabled={isButtonDisabled}
                onClick={async () => {
                    transferMutation.mutateAsync();
                }}
                className={mergeClasses(
                    'bPrimary h-16 w-full mt-12',
                    isButtonDisabled && 'disabled',
                )}
            >
                {transferMutation.isPending ? 'Sending...' : 'Send'}
            </button>
        </div>
    );
};
