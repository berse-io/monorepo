import { inject, Provider } from "@loopback/context";
import { EthereumChainTracker } from "./ethereum";
import { Repository } from "typeorm";
import { Chain } from "../db/entity/chain";
import { ChainEvent } from "../db/entity/chain_event";
import { InterchainStateUpdate } from "../db/entity/interchain_state_update";
import { CrosschainStateService } from "../interchain/xchain_state_service";

export class ChainTrackerFactory {
    @inject('repositories.Chain') chain: Repository<Chain>
    @inject('repositories.ChainEvent') chainEvent: Repository<ChainEvent>
    @inject('repositories.InterchainStateUpdate') stateUpdate: Repository<InterchainStateUpdate>
    @inject('interchain.CrosschainStateService') crosschainStateService: CrosschainStateService;

    @inject('trackers.EthereumChainTracker') ethereumChainTracker: typeof EthereumChainTracker;
    
    constructor(
    ) {
    }

    async create(conf: any): Promise<EthereumChainTracker> {
        // let t = await ctx.get<typeof EthereumChainTracker>('trackers.EthereumChainTracker')
        let tracker = new this.ethereumChainTracker(conf);
        // let tracker = new EthereumChainTracker(conf)
        // console.log(tracker.chain)
        // return tracker
        
        tracker.chain = this.chain;
        tracker.chainEvent = this.chainEvent;
        tracker.stateUpdate = this.stateUpdate
        tracker.crosschainStateService = this.crosschainStateService
        return tracker

        // console.log(tracker.chain)
        // let k = `trackers.EthereumChainTracker.${tracker.id}`
        // ctx.bind(`trackers.EthereumChainTracker.${tracker.id}`).to(tracker)
        // let tracker2 = await ctx.get<EthereumChainTracker>(k)
        // console.log(tracker2.chain)
        // return await ctx.get<EthereumChainTracker>(k)
    }
}