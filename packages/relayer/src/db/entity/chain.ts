import {Entity, PrimaryColumn, Column, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { InterchainStateUpdate } from "./interchain_state_update";
import { ChainEvent } from "./chain_event";
import { Snapshot } from "./snapshot";

@Entity()
export class Chain {
    // @PrimaryGeneratedColumn()
    // id: number;
    
    @PrimaryColumn({ name: "chainId" })
    chainId: number;

    @OneToMany(type => ChainEvent, event => event.chain)
    events: ChainEvent[];

    @OneToMany(type => InterchainStateUpdate, u => u.chain)
    stateUpdates: InterchainStateUpdate[];

    @OneToMany(type => Snapshot, s => s.chain)
    snapshots: Snapshot[];
}