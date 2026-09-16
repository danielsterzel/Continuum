# Architektura Continuum

Diagramy opisują aktualny stan kodu w repozytorium, a nie elementy zaplanowane w roadmapie.

## Diagramy

- `continuum-architecture-readable.png` — topologia aplikacji i pełny przepływ synchronizacji local-first.
- `continuum-data-model.png` — relacje encji oraz rola lokalnej kolejki i serwerowego dziennika zmian.
- Pliki `.svg` są wersjami wektorowymi do powiększania.
- Pliki `.dot` są edytowalnymi źródłami Graphviz.
- Diagramy sekwencji przepływu synchronizacji znajdują się w katalogu `../sequence`.

## Najważniejszy przepływ

1. Interfejs zapisuje zmianę najpierw w lokalnym SQLite i, dla mediów lub ikon, w lokalnym magazynie plików.
2. `EntitySyncMapper` zamienia encję na payload synchronizacji i dodaje ją do lokalnej tabeli `sync_changes` (wzorzec outbox).
3. `SyncService` uruchamia `syncCycle` po zalogowaniu oraz co 30 sekund.
4. Klient wysyła maksymalnie 20 zmian do `POST /sync/initiate/{user_id}`. Po zaakceptowaniu metadanych osobno wysyła bajty plików.
5. Backend wybiera resolver encji, sprawdza ownership/urządzenie, wykonuje operację w PostgreSQL, dopisuje serwerowy `sync_changes` i zwiększa `version`.
6. Dopiero po opróżnieniu lokalnej kolejki klient pobiera pełny `SyncState`, wykonuje lokalne upserty/usunięcia i pobiera brakujące pliki.

## Istotne ograniczenia obecnej implementacji

- PULL zwraca pełny snapshot, a nie zmiany od kursora.
- `expected_version` jest przesyłane i zapisywane, ale nie jest jeszcze porównywane podczas rozwiązywania konfliktu.
- Endpointy synchronizacji przyjmują `user_id`; nie ma jeszcze sesji ani JWT.
- `MediaProgress` nie ma operacji DELETE; pozostałe synchronizowane encje używają tombstones/soft-delete po stronie serwera.

## Regenerowanie obrazów

Wymagany jest Graphviz (`dot`):

```bash
dot -Tpng -Gdpi=180 continuum-architecture.dot -o continuum-architecture-readable.png
dot -Tsvg continuum-architecture.dot -o continuum-architecture-readable.svg
dot -Tpng -Gdpi=180 continuum-data-model.dot -o continuum-data-model.png
dot -Tsvg continuum-data-model.dot -o continuum-data-model.svg
```
