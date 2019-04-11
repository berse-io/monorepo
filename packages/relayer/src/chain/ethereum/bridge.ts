import { BridgeContract, BridgeEvents } from "@ohdex/contracts/lib/build/wrappers/bridge";
import { ethers } from "ethers";
import { Web3ProviderEngine, BigNumber } from "0x.js";
import { EventEmitter } from "events";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { CrosschainEventProof } from "../../interchain/crosschain_state";
import { hexify } from "@ohdex/shared";
import { CrosschainEvent } from ".";
import { EventProof } from "../../interchain/xchain_state_service";

export interface TokensBridgedEvent {
    eventHash: string 
    targetBridge: string, 
    chainId: any
    receiver: string
    token: string
    amount: any
    salt: any

    // TODO: this could be improved
    triggerAddress: string;
}

export class BridgeAdapter {
    bridgeContract: BridgeContract;
    bridgeContract_sub: ethers.Contract;
    events = new EventEmitter()

    constructor(
        private ethersProvider: ethers.providers.Provider,
        private logger: any,
        bridgeAddress: string,
        pe: Web3ProviderEngine,
        private txDefaults: any,
        private web3Wrapper: Web3Wrapper
    ) {
        this.bridgeContract = new BridgeContract(
            require('@ohdex/contracts/build/artifacts/Bridge.json').compilerOutput.abi,
            bridgeAddress,
            pe,
            txDefaults
        )

        this.bridgeContract_sub = new ethers.Contract(
            bridgeAddress,
            require('@ohdex/contracts/build/artifacts/Bridge.json').compilerOutput.abi,
            this.ethersProvider
        )
    }

    async loadPreviousBridgeEvents(): Promise<TokensBridgedEvent[]> {
        let previous = [];

        const TokensBridged = this.bridgeContract_sub.filters.TokensBridged();
        const logs = await this.ethersProvider.getLogs({
            fromBlock: 0,
            toBlock: "latest",
            address: this.bridgeContract_sub.address,
            topics: TokensBridged.topics
        });

        for (const log of logs) {
            let decoded = this.bridgeContract_sub.interface.events.TokensBridged.decode(log.data, log.topics)
            
            let data = decoded;
    
            let tokensBridgedEv: TokensBridgedEvent = {
                // fromChain: this.stateGadget.getId(),
                // fromChainId: this.conf.chainId,
                ...data,
                triggerAddress: this.bridgeContract.address
                // toBridge: data.targetBridge,
                // eventHash: data.eventHash
            };
            previous.push(tokensBridgedEv)
        }

        return previous;
    }

    listen() {
        let self = this;

        // 3) Listen to the original events of the bridge/escrow contracts
        // So we can relay them later
        this.bridgeContract_sub.on(
            BridgeEvents.TokensBridged, 
            async function(eventHash, targetBridge, chainId, receiver, token, amount, salt, ev: ethers.Event) {
                let tokensBridgedEv: TokensBridgedEvent = {
                    eventHash, targetBridge, chainId, receiver, token, amount, salt,
                    triggerAddress: self.bridgeContract.address
                }
                self.events.emit('tokensBridged', tokensBridgedEv)
            }
        )
    }

    async stop() {
        await this.bridgeContract_sub.removeAllListeners(BridgeEvents.TokensBridged)
    }

    async bridge(
        ev: CrosschainEvent<TokensBridgedEvent>,
        proof: EventProof
    ) {
        let originChainId = new BigNumber(ev.from.chainId);

        // this.logger.info(`Bridge.claim: estimateGas=${gas}`)

        try {
            await this.web3Wrapper.awaitTransactionSuccessAsync(
                await this.bridgeContract.claim.sendTransactionAsync(
                    ev.data.token, 
                    ev.data.receiver, 
                    ev.data.amount, 
                    ev.data.salt, 
                    ev.data.triggerAddress,
                    originChainId,
                    false, //need to fix this for bridging back
                    proof.eventLeafProof.proofs.map(hexify),
                    proof.eventLeafProof.paths,
                    proof.stateProof.proofBitmap,
                    proof.stateProof.proofNodes,
                    { ...this.txDefaults, gas: 5000000 }
                )
            );
            this.logger.info(`bridged ev: ${ev.data.eventHash} for bridge ${ev.to.targetBridge}`)
        } catch(ex) {
            throw ex;
        }
    }
}