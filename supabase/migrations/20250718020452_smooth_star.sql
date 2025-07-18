/*
  # Adicionar campo de observação na tabela presents

  1. Alterações na Tabela
    - Adicionar coluna `observation` na tabela `presents`
    - Campo opcional para cupons, descontos e outras observações
    - Valor padrão vazio

  2. Detalhes
    - Tipo: text (permite textos longos)
    - Nullable: true (campo opcional)
    - Default: string vazia
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'presents' AND column_name = 'observation'
  ) THEN
    ALTER TABLE presents ADD COLUMN observation text DEFAULT '' NULL;
  END IF;
END $$;