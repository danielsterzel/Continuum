# Architektura Continuum

Diagramy opisują aktualny stan kodu w repozytorium, a nie elementy zaplanowane w roadmapie.

## Diagramy

- `continuum-sync-overview.svg` — skrócony, anglojęzyczny diagram synchronizacji używany w głównym README.
- `continuum-architecture-readable.png` — topologia aplikacji i pełny przepływ synchronizacji local-first.
- `continuum-data-model.png` — relacje encji oraz rola lokalnej kolejki i serwerowego dziennika zmian.
- Pliki `.svg` są wersjami wektorowymi do powiększania.
- Pliki `.dot` są edytowalnymi źródłami Graphviz.
- Diagramy sekwencji przepływu synchronizacji znajdują się w katalogu `../sequence`.

### Wersja Mermaid przeznaczona do druku

Duży diagram został rozdzielony na cztery czytelne arkusze:

1. `continuum-architecture-overview.mmd` — skrót całego systemu; A4 pionowo.
2. `continuum-architecture-client.mmd` — klient, zapis local-first i synchronizacja; A4 poziomo.
3. `continuum-architecture-network.mmd` — kontrakty na granicy sieciowej; A4 poziomo.
4. `continuum-architecture-server.mmd` — FastAPI, logika synchronizacji, PostgreSQL i pliki; A4 pionowo.

Kolory zachowują znaczenie pomiędzy arkuszami: niebieski oznacza interfejs klienta,
fioletowy warstwę HTTP/serwer, żółty synchronizację, zielony bazy i repozytoria,
a pomarańczowy magazyny plików. Każdy arkusz można czytać niezależnie.
Wersje wynikowe są generowane wyłącznie jako formaty wektorowe (`.svg` i `.pdf`),
bez pośrednich plików PNG/JPG.

## Najważniejszy przepływ

1. Interfejs zapisuje zmianę najpierw w lokalnym SQLite i, dla mediów lub ikon, w lokalnym magazynie plików.
2. `EntitySyncMapper` zamienia encję na payload synchronizacji i dodaje ją do lokalnej tabeli `sync_changes` (wzorzec outbox).
3. `SyncService` uruchamia `syncCycle` po zalogowaniu oraz co 30 sekund.
4. Klient wysyła maksymalnie 20 zmian do `POST /sync/initiate/{user_id}`. Po zaakceptowaniu metadanych osobno wysyła bajty plików.
5. Backend wybiera resolver encji, sprawdza ownership/urządzenie, wykonuje operację w PostgreSQL, dopisuje serwerowy `sync_changes` i zwiększa `expected_version` encji.
6. Dopiero po opróżnieniu lokalnej kolejki klient pobiera pełny `SyncState`, wykonuje lokalne upserty/usunięcia i pobiera brakujące pliki.

## Istotne ograniczenia obecnej implementacji

- PULL zwraca pełny snapshot, a nie zmiany od kursora.
- `version` zmiany jest porównywane z `expected_version` encji; niezgodność kieruje zmianę do resolvera z polityką konfliktu właściwą dla danego typu encji.
- Endpointy synchronizacji przyjmują `user_id`; nie ma jeszcze sesji ani JWT.
- `MediaProgress` nie ma operacji DELETE; pozostałe synchronizowane encje używają tombstones/soft-delete po stronie serwera.

## Regenerowanie obrazów

Wymagany jest Graphviz (`dot`):

```bash
dot -Tpng -Gdpi=180 continuum-sync-overview.dot -o continuum-sync-overview.png
dot -Tsvg continuum-sync-overview.dot -o continuum-sync-overview.svg
dot -Tpng -Gdpi=180 continuum-architecture.dot -o continuum-architecture-readable.png
dot -Tsvg continuum-architecture.dot -o continuum-architecture-readable.svg
dot -Tpng -Gdpi=180 continuum-data-model.dot -o continuum-data-model.png
dot -Tsvg continuum-data-model.dot -o continuum-data-model.svg
```

Źródła Mermaid najlepiej eksportować do SVG, ponieważ format wektorowy zachowuje
czytelność tekstu po dopasowaniu do jednej strony A4:

```bash
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-overview.mmd -o continuum-architecture-overview.svg -b '#F8FAFC'
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-client.mmd -o continuum-architecture-client.svg -b '#F8FAFC'
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-network.mmd -o continuum-architecture-network.svg -b '#F8FAFC'
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-server.mmd -o continuum-architecture-server.svg -b '#F8FAFC'
```

Analogiczny eksport do wektorowego PDF:

```bash
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-overview.mmd -o continuum-architecture-overview.pdf
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-client.mmd -o continuum-architecture-client.pdf
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-network.mmd -o continuum-architecture-network.pdf
npx --yes @mermaid-js/mermaid-cli -c mermaid-config.json -i continuum-architecture-server.mmd -o continuum-architecture-server.pdf
```

Przy drukowaniu SVG należy wybrać `A4`, marginesy wąskie i opcję „Dopasuj do
strony”. Diagramy klienta i granicy sieciowej są przeznaczone do orientacji
poziomej, a przegląd i serwer — do orientacji pionowej.
