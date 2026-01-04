# Importação de Dados CID-10

Para atualizar a lista de códigos CID-10 a partir de um arquivo CSV, siga os passos abaixo.

## Formato do CSV

O arquivo CSV deve conter duas colunas: Código e Descrição.
Pode usar vírgula (`,`) ou ponto e vírgula (`;`) como separador.

Exemplo:
```csv
code,description
A00,Cólera
A01,Febre tifóide e paratifóide
...
```

## Como Executar

Certifique-se de ter o Node.js instalado.

1. Coloque seu arquivo CSV em algum lugar acessível (ex: `cids.csv` na raiz).
2. Execute o script de importação:

```bash
node scripts/import_cids.mjs path/to/your/file.csv
```

Exemplo:
```bash
node scripts/import_cids.mjs ./cids.csv
```

O script irá ler o arquivo CSV e atualizar `client/src/data/cid10.json`.
O frontend utilizará os novos dados automaticamente após a reconstrução (build) ou reinício do servidor de desenvolvimento.
