import { BigNumber } from "@0x/utils";
import { BridgedTokenContract } from "@ohdex/contracts/lib/build/wrappers/bridged_token";
import { ContractWrappers, _chainId, _salt } from '@ohdex/shared';
import { consoleOpts } from '../../src/logger';
import { Relayer } from '../../src/relayer';
import { get0xArtifact, loadWeb3, Testchain, TestchainFactory } from '../helper';

import chainlog from 'chainlog'

describe('Relayer', function() {
    this.timeout(10000);

    it(`shouldn't throw if event is not notarised yet`, async () => {
        
    })

    it('processes bridge events after a state root update', async () => {

    })

    it('processes bridge events from a previous checkpoint', async () => {

        // chain1 is at checkpoint X for chain2
        // chain3 is at checkpoint X+2 for chain1
        
    })

    // try break it
    // observe and learn

    describe.only('interchain state', function() {
        let testchain1: Testchain, testchain2: Testchain;
        let chain1 = require('@ohdex/config').networks.kovan;
        let chain2 = require('@ohdex/config').networks.rinkeby;

        before(async () => {
            // setup testchains
            testchain1 = await TestchainFactory.fork(chain1.rpcUrl, '11000')
            testchain2 = await TestchainFactory.fork(chain2.rpcUrl, '11001')
            chain1.rpcUrl = testchain1.rpcUrl;
            chain2.rpcUrl = testchain2.rpcUrl;

            // await chainlog({ config: require.resolve('@ohdex/relayer/test/test2.yml') })
            await chainlog({ config: require.resolve('@ohdex/relayer/test/test.yml') })

            // add test funds to the relayer wallet

            return;
        })

        // it('should load all previous events', async () => {
        // })

        it('should ack events', async() => {
            consoleOpts.silent = false;
            let relayer = new Relayer({
                chain1,
                chain2
            })

            await relayer.start()

            // emit one event
            let { 
                pe: pe1,
                account: account1,
                txDefaults: txDefaults1
            } = await loadWeb3(chain1);
            let {
                pe: pe2,
                account: account2,
                txDefaults: txDefaults2
            } = await loadWeb3(chain2);

            let wrappers1 = ContractWrappers.from(chain1, pe1)
            let wrappers2 = ContractWrappers.from(chain2, pe2)

            const bridgedToken1 = await BridgedTokenContract.deployFrom0xArtifactAsync(
                get0xArtifact('BridgedToken'),
                pe1,
                txDefaults1
            )
            const bridgedToken2 = await BridgedTokenContract.deployFrom0xArtifactAsync(
                get0xArtifact('BridgedToken'),
                pe2,
                txDefaults2
            )

            // @ts-ignore
            const bridgeAmt = new BigNumber('10000');
            
            await bridgedToken1.mint.sendTransactionAsync(account1, bridgeAmt, txDefaults1);
            await bridgedToken1.approve.sendTransactionAsync(wrappers1.Escrow.address, bridgeAmt, txDefaults1);
            
            await bridgedToken2.mint.sendTransactionAsync(account2, bridgeAmt, txDefaults2);
            await bridgedToken2.approve.sendTransactionAsync(wrappers2.Escrow.address, bridgeAmt, txDefaults2);

            await Promise.all([
                wrappers1.Escrow.bridge.sendTransactionAsync(
                    chain2.bridgeAddress, 
                    bridgedToken1.address, 
                    account1, new BigNumber('300'), 
                    _chainId, _salt,
                    txDefaults1
                ),
                // wrappers1.Escrow.bridge.sendTransactionAsync(
                //     chain2.bridgeAddress, 
                //     bridgedToken1.address, 
                //     account1, new BigNumber('300'), 
                //     _chainId, _salt,
                //     txDefaults1
                // ),
                // wrappers2.Escrow.bridge.sendTransactionAsync(
                //     chain1.bridgeAddress, 
                //     bridgedToken2.address, 
                //     account2, new BigNumber('300'), 
                //     _chainId, _salt,
                //     txDefaults2
                // )
            ])
            

            await new Promise((res,rej)=>setTimeout(res,7500))
            
        })

        // now describe the bug

        it("proves events with this chain's state root", async () => {
            
        })
        it("updates a chain's state root")
    })

    // create event on one chain
    // update the state root of that chain
    // route the event to the second chain
    // update the second chain but not the state root of the first chain
    // the update to the first chain shouldn't be processed if it doesnt ack all the events
    // bridge event shouldn't be processed on the second chain if it hasnt been notarised


    // the problem
    // is that the crosschain state only stores one merkle root
    // whereas we need one for every chain
    // the events are always the same
    // but we need to 

    // update one 
    // update the other
    // we have to compute the event proof
    // we then have to compute the state root proof for THIS current state root
})