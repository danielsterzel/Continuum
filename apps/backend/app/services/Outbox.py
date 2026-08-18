class OutBox:
    """
    Container for updates / deletes / adds of states of the application

    Used to queue the changes and batch them before sending them to sync service

    Main idea behind it was to ensure that local changes will be saved to the time when
    a sync is possible (reconnect with internet)



    schema
    PHONE
    │
    ├── LOCAL STATE
    │
    └── OUTBOX (IndexedDB)
           ↓
        POST /sync
           ↓
       SyncService
           ↓
        POSTGRES
           ↓
      authoritative state
           ↓
    answer  PHONE
    """

    ...
