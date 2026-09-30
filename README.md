# Buenos Aires 2026

Guia estático de 15 a 19 de outubro de 2026, com a mesma proposta de leitura do projeto Paris–Londres: abas, dias expansíveis, busca, checklist local, mapas e impressão.

Sem dependências e sem compilação. A página pública é `index.html`. A aba “Acesso offline” guarda o roteiro e o passe do estacionamento no navegador de cada celular, para reabrir no mesmo navegador; comprovantes, contatos e mapas precisam ser salvos separadamente nos respectivos apps. Não publicar comprovantes ou localizadores de viagem, exceto o passe Indigo em `estacionamento.html`, cuja exibição aberta foi expressamente autorizada pelo usuário.

Validação: `node check.mjs`. Abrir `index.html` em um navegador para uso local.

Página publicada: https://lmteixeira17.github.io/viagem-paris-londres-2026/buenos-aires/

Fonte versionada: https://github.com/lmteixeira17/viagem-buenos-aires-2026

A credencial disponível não tem permissão para ativar Pages no novo repositório (HTTP 403). A publicação reutiliza o Pages já ativo de `lmteixeira17/viagem-paris-londres-2026`, branch `main`, caminho `buenos-aires/index.html`. O `index.html` da raiz de Paris–Londres deve permanecer intacto.

Para atualizar: validar e fazer commit/push neste repositório; publicar os mesmos bytes de `index.html` e `service-worker.js` em `buenos-aires/` pela API de conteúdo do GitHub, informando o SHA de cada arquivo existente. Aguardar o build do Pages e comparar o conteúdo HTTP publicado com os arquivos locais. Não publicar outros documentos originais; o passe Indigo em `estacionamento.html` é a exceção autorizada pelo usuário.

O checklist tem 38 etapas, com 16 confirmadas, incluindo escolha e reserva do AQ Tailored e do tango El Querandí e a definição da bagagem/transporte em Buenos Aires conforme informado pelo viajante. As confirmações da conversa são publicadas no próprio HTML (`data-confirmed="true" checked disabled`) e aparecem em todos os aparelhos após atualizar a página. Marcar uma decisão não confirma a contratação: hotel escolhido e hotel reservado são etapas separadas, assim como pacote e reserva do tango. Só dar baixa em reservas após confirmação do fornecedor ou relato explícito do usuário.

As marcações manuais são locais e identificadas como “Marcado neste aparelho”; não fazem reservas nem alteram as confirmações publicadas. Chaves antigas são preservadas. Ao reabrir uma etapa ou mudar seu significado, remover sua confirmação, incrementar `data-revision` e atualizar a descrição para invalidar marcações locais antigas. Manter contagem inicial, próximos passos, roteiro e documento de planejamento coerentes. Não publicar e-mail, telefone pessoal, documentos, localizadores ou dados de cartão.

A cada decisão confirmada pelo usuário nesta conversa, atualizar o item correspondente, validar e republicar. Isso é manutenção durante a conversa, sem monitoramento ou automação recorrente.

Atualização em 30/09: benefício do cartão escolhido para o seguro; etapa `insurance` na revisão 2, status “A emitir”, sem confirmação de emissão. Emitir um certificado para cada viajante e salvar nos dois celulares. Não publicar informações do cartão. Don Julio: e-mail validado, nome/telefone informados com autorização, 17/10 às 13h30 para dois, à la carte e área externa. Termos e garantia de ARS 70.000 no total autorizados; sem cobrança agora, possível cobrança por não comparecimento e cancelamento/alteração com ao menos 6 horas de antecedência. Falta preencher cartão diretamente no fornecedor e concluir; reserva ainda não confirmada.

Conferência de e-mails e conta em 28/09/2026: AQ Tailored reservado com tarifa não reembolsável; voucher do tango recebido, duas pessoas e retirada no AQ Tailored. Consulta autenticada em 28/09 na Azul pelo Mundo e na Air Canada: bilhetes dos dois passageiros identificados e ida/volta com status Confirmed, Business Class Standard. Datas, horários e aeroportos conferidos. O alerta “Status Prevenção: PENDENTE” da Azul foi esclarecido pela confirmação da Air Canada; não há ação adicional pendente sobre esse aviso. Conferido na Air Canada para os dois, na ida e volta: duas malas despachadas gratuitas de até 32 kg cada, soma das dimensões até 158 cm. Bagagem de mão: 55 × 40 × 23 cm; item pessoal: 43 × 33 × 16 cm. A mala de mão deve ser colocada no compartimento superior sem ajuda; item pessoal sob o assento. Nomes dos dois confirmados como corretos pelo viajante em 28/09; não manter pendência de comparação dos nomes. Assentos não atribuídos. Don Julio segue sem reserva; campo de e-mail vazio no Meitre.

Pesquisa e planejamento: 28/09/2026. O teto de hotel é R$ 2.000 por noite; Uber/Cabify são a primeira opção de transporte aeroportuário, respeitando a capacidade de bagagem.

Estacionamento GRU: reserva paga e conferida no e-mail da Indigo de 28/09 às 15h34 e no passe com QR Code. Edifício-garagem coberto T3, de 15/10/2026 às 7h até 19/10/2026 às 21h, R$ 561,75 (535,00 + 26,75 de serviços). Placa conferida. Voucher: 1 hora de tolerância na entrada e 3 horas na saída; primeira cancela à esquerda, mesmo QR Code na entrada e saída. Chave brazil-transfer confirmada, revisão 3; contagem 16/38. Não publicar placa ou número da reserva. O passe em `estacionamento.html` fica aberto por autorização expressa do usuário. O service worker guarda o guia e o passe em cache local no navegador; o QR do passe foi fornecido como imagem no guia. Os demais comprovantes e mapas devem ser salvos separadamente em cada celular.
