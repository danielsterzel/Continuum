import {v4} from 'uuid';

import type { SyncChange } from "@/types/sync_change";

type SyncQueue = Record<string, SyncChange>;
const QUEUE_KEY = "queue"

export function getQueue(): SyncQueue
{
    const queue = localStorage.getItem(QUEUE_KEY);
    if(!queue)
        
        {
            return {};
        }

    return JSON.parse(queue) as SyncQueue;
}


function enqueueChange(syncEntity: SyncChange)
{

    const id = syncEntity.id ?? v4();
    const change: SyncChange = {
        ...syncEntity,
        id,
    }
    
    const queue = getQueue();

    queue[id] = change;

    localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue),
    );

}

export function getPendingChanges(): SyncChange[]
{
    return Object.values(getQueue());
}

export function removeFromQueue(id: string)
{
    const queue: SyncQueue = getQueue();

    delete queue[id];

    localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify(queue),
    );
}
