# Importação de Dados CID-10

Para atualizar a lista de códigos CID-10 a partir de um arquivo externo, utilize o script `scripts/import_cids.mjs`.

## Formatos Suportados

### Excel (.xlsx, .xls)
O arquivo deve conter uma planilha com colunas identificáveis como "Código" (ou "Code", "CID") e "Descrição" (ou "Description", "Nome").
Caso as colunas não sejam identificadas pelo nome, o script tentará usar a primeira coluna como código e a segunda como descrição.

### CSV (.csv)
O arquivo deve conter duas colunas: Código e Descrição.
Separadores suportados: vírgula (`,`) ou ponto e vírgula (`;`).

Exemplo:
```csv
code,description
A00,Cólera
A01,Febre tifóide e paratifóide
...
```

## Como Executar

Certifique-se de ter o Node.js instalado e as dependências do projeto (incluindo `xlsx`).

```bash
npm install
```

1. Coloque seu arquivo (ex: `cids.xlsx` ou `cids.csv`) em um local acessível.
2. Execute o script de importação:

```bash
node scripts/import_cids.mjs path/to/your/file.xlsx
```

Exemplo:
```bash
node scripts/import_cids.mjs ./DATA/cids.xlsx
```

O script irá ler o arquivo e atualizar `client/src/data/cid10.json`.
O frontend utilizará os novos dados automaticamente após a reconstrução (build) ou reinício do servidor de desenvolvimento.
