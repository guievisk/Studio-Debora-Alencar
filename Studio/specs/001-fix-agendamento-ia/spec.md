# Feature Specification: Agendamento por IA confiável

**Feature Branch**: `001-fix-agendamento-ia`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "A assistente de agendamento está delirando com horários. Ela fala horários e, quando a cliente confirma o horário, ela diz que já foi agendado. Tratar com urgência."

## Visão Geral

A assistente virtual de agendamento (Luna) descreve à cliente um estado do mundo que não corresponde ao estado real da agenda. Isso acontece em duas frentes que se reforçam:

1. **Na oferta**: ela apresenta datas e horários que não são reais ou não estão livres.
2. **Na confirmação**: depois que a cliente escolhe um horário, a resposta da assistente não corresponde ao que de fato aconteceu — ela pode afirmar que o horário "já foi agendado" logo após tê-lo reservado com sucesso, ou reportar falha técnica para um agendamento que na verdade foi gravado.

O efeito de negócio é duplo e grave: a cliente desiste achando que não conseguiu agendar, **e** a agenda fica com um compromisso-fantasma que ninguém sabe que existe. O studio perde a cliente e ainda bloqueia o horário.

Esta feature trata da **honestidade da assistente**: tudo que ela afirma sobre disponibilidade e sobre o resultado de um agendamento deve corresponder ao estado real da agenda, sempre.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A cliente sempre sabe se está agendada ou não (Priority: P1)

A cliente escolhe um horário oferecido pela assistente e confirma. A assistente responde com uma afirmação inequívoca e verdadeira: ou "está agendado" (e o compromisso existe na agenda), ou "não deu certo, e por isso" (e nada foi gravado). Nunca uma coisa dizendo a outra.

**Why this priority**: É o bug que está fazendo o studio perder cliente agora. Uma cliente que recebe "já foi agendado" ou "tive um problema técnico" desiste do atendimento — enquanto o horário fica bloqueado por um agendamento que ela não sabe que tem. É o único cenário em que o sistema erra e as duas partes ficam prejudicadas ao mesmo tempo. Resolver só isto já devolve a confiabilidade básica do canal.

**Independent Test**: Conduzir uma conversa completa de agendamento até a confirmação e comparar, para cada desfecho possível, a mensagem final recebida pela cliente com o conteúdo real da agenda. Testável sem tocar em nenhuma outra história.

**Acceptance Scenarios**:

1. **Given** uma cliente que escolheu um horário livre e informou nome e WhatsApp, **When** ela confirma o agendamento, **Then** a assistente afirma que está agendado **e** existe exatamente um compromisso correspondente na agenda.
2. **Given** uma cliente que acabou de ter seu agendamento criado com sucesso, **When** a assistente formula a resposta final, **Then** ela nunca afirma que o horário está indisponível, ocupado ou "já agendado por outra pessoa".
3. **Given** uma tentativa de agendamento que foi efetivamente gravada na agenda, **When** qualquer falha ocorre depois da gravação, **Then** a cliente recebe a confirmação do agendamento (e não uma mensagem de erro).
4. **Given** uma tentativa de agendamento que não foi gravada, **When** a assistente responde, **Then** ela declara explicitamente que não foi agendado e indica o que fazer em seguida.
5. **Given** uma cliente que confirma o mesmo horário duas vezes seguidas na mesma conversa, **When** a segunda confirmação é processada, **Then** ela recebe a confirmação do seu agendamento já existente, e não uma mensagem de conflito, e a agenda contém apenas um compromisso.

---

### User Story 2 - Todo horário oferecido é real e agendável (Priority: P2)

Quando a assistente menciona uma data ou um horário, aquele horário existe, está dentro do expediente do studio, está livre e pode ser reservado naquele momento.

**Why this priority**: É a causa do "delírio" relatado. Um horário inventado vira frustração na hora da confirmação e, pior, pode virar um compromisso real fora do expediente. Depende da P1 estar de pé para que a correção seja observável ponta a ponta, mas entrega valor sozinha: a cliente para de receber opções falsas.

**Independent Test**: Pedir horários para várias datas (hoje, amanhã, dia de folga, data passada) e conferir cada horário oferecido contra a disponibilidade real configurada e contra os compromissos já existentes.

**Acceptance Scenarios**:

1. **Given** qualquer momento em que a assistente esteja atendendo, **When** ela interpreta "hoje", "amanhã", "sexta-feira" ou "semana que vem", **Then** a data resolvida corresponde ao dia corrente real no fuso horário do studio.
2. **Given** um serviço e uma data, **When** a assistente oferece horários, **Then** todos os horários oferecidos estão dentro de um bloco de expediente ativo para aquele dia da semana e comportam a duração integral do serviço.
3. **Given** uma data marcada como bloqueada na agenda, **When** a cliente pede horários para essa data, **Then** a assistente informa que não há atendimento nesse dia e não oferece nenhum horário.
4. **Given** um horário já ocupado por outro compromisso, **When** a assistente oferece opções, **Then** aquele horário não aparece entre as opções.
5. **Given** que a cliente pede horários para o dia de hoje, **When** parte do expediente já passou, **Then** somente horários ainda futuros são oferecidos.
6. **Given** uma cliente que pede um horário específico, **When** aquele horário não está disponível, **Then** a assistente diz que não está disponível — e nunca o oferece mesmo assim.

---

### User Story 3 - A agenda só aceita compromissos válidos (Priority: P3)

Independentemente do que a assistente diga ou deixe de dizer, a agenda recusa qualquer compromisso que viole as regras do studio: fora do expediente, em dia bloqueado, no passado, ou com duração incompatível com o serviço.

**Why this priority**: É a rede de proteção. As histórias P1 e P2 reduzem a chance de a assistente errar; esta garante que, quando ela errar mesmo assim, o erro não chega à agenda da Débora. Vale por si só porque protege contra qualquer origem de dado ruim, não só a assistente.

**Independent Test**: Submeter tentativas de agendamento inválidas diretamente à agenda, sem passar pela conversa, e verificar que todas são recusadas com o motivo correto.

**Acceptance Scenarios**:

1. **Given** uma tentativa de agendamento em horário fora de qualquer bloco de expediente ativo, **When** ela é submetida, **Then** é recusada e nada é gravado.
2. **Given** uma tentativa de agendamento em data bloqueada, **When** ela é submetida, **Then** é recusada e nada é gravado.
3. **Given** uma tentativa de agendamento em data ou horário já passado, **When** ela é submetida, **Then** é recusada e nada é gravado.
4. **Given** uma tentativa de agendamento cuja duração ultrapassa o fim do expediente, **When** ela é submetida, **Then** é recusada e nada é gravado.
5. **Given** uma tentativa de agendamento sem nome ou sem WhatsApp da cliente, **When** ela é submetida, **Then** é recusada e nada é gravado.
6. **Given** uma tentativa de agendamento vinda de fora da conversa com a assistente, **When** ela é submetida, **Then** ela passa exatamente pelas mesmas validações.

---

### User Story 4 - Duas clientes nunca ficam com o mesmo horário (Priority: P4)

Quando duas clientes tentam reservar o mesmo horário ao mesmo tempo, exatamente uma consegue. A outra é informada com clareza de que o horário acabou de ser tomado e recebe alternativas.

**Why this priority**: É a falha mais rara das quatro — exige simultaneidade real — mas é a de maior custo quando acontece: duas clientes aparecem no studio para o mesmo horário. Fica por último porque as outras três são frequentes e diárias, mas precisa entrar antes de qualquer aumento de volume.

**Independent Test**: Disparar duas tentativas concorrentes para o mesmo horário e verificar que a agenda contém um único compromisso e que a segunda cliente recebeu uma recusa explícita.

**Acceptance Scenarios**:

1. **Given** duas tentativas simultâneas para o mesmo horário e serviço, **When** ambas são processadas, **Then** a agenda contém exatamente um compromisso.
2. **Given** duas tentativas simultâneas para o mesmo horário, **When** uma é aceita, **Then** a outra recebe uma recusa explícita informando que o horário foi tomado.
3. **Given** duas tentativas simultâneas para horários que se sobrepõem parcialmente, **When** ambas são processadas, **Then** apenas a primeira é aceita.

---

### Edge Cases

- **A cliente demora e o horário some**: ela escolhe um horário oferecido e leva vários minutos para informar nome e WhatsApp; nesse meio-tempo o horário é tomado. A assistente precisa perceber isso na confirmação e informar com clareza, oferecendo alternativas — não gravar por cima.
- **Virada de dia durante a conversa**: a conversa começa às 23h50 e a confirmação chega às 00h05. "Hoje" mudou de significado no meio do atendimento.
- **A conversa é retomada dias depois**: o histórico da conversa é persistido e recarregado. Horários oferecidos em uma sessão antiga não valem mais na nova sessão.
- **Serviço sem duração configurada**: o serviço existe no catálogo mas não tem duração cadastrada. A assistente não pode assumir uma duração qualquer.
- **A cliente pede um horário no limite do expediente**: o horário de início está dentro do expediente, mas o serviço termina depois do fechamento.
- **A cliente informa um horário ambíguo**: "às 3" pode ser 03:00 ou 15:00. A interpretação escolhida precisa ser confirmada com ela antes de virar agendamento.
- **A agenda está indisponível no momento da confirmação**: a assistente não pode afirmar sucesso nem fracasso sem saber o resultado real.

## Requirements *(mandatory)*

### Functional Requirements

**Honestidade da confirmação (US1)**

- **FR-001**: O sistema MUST garantir que toda afirmação de sucesso feita à cliente corresponda a um compromisso efetivamente existente na agenda.
- **FR-002**: O sistema MUST garantir que toda afirmação de falha feita à cliente corresponda à ausência de compromisso gravado na agenda.
- **FR-003**: O sistema MUST tratar confirmações repetidas do mesmo agendamento dentro de uma mesma conversa como uma única reserva, retornando sempre o resultado da primeira.
- **FR-004**: O sistema MUST NOT apresentar à cliente um compromisso criado por ela própria como se fosse conflito com terceiros.
- **FR-005**: O sistema MUST entregar a confirmação à cliente mesmo quando ocorrer qualquer falha posterior à gravação do compromisso.
- **FR-006**: O sistema MUST informar explicitamente, em toda recusa, o motivo e o próximo passo sugerido.

**Fidelidade da oferta (US2)**

- **FR-007**: O sistema MUST resolver a data corrente a cada atendimento, no fuso horário do studio, sem reutilizar uma data calculada anteriormente.
- **FR-008**: O sistema MUST oferecer somente horários que estejam dentro de um bloco de expediente ativo e que comportem a duração integral do serviço solicitado.
- **FR-009**: O sistema MUST excluir da oferta horários já ocupados por compromissos existentes.
- **FR-010**: O sistema MUST excluir da oferta horários já passados quando a data solicitada for o dia corrente.
- **FR-011**: O sistema MUST informar ausência de atendimento para datas bloqueadas e para dias da semana sem expediente ativo, sem oferecer horários.
- **FR-012**: O sistema MUST NOT apresentar à cliente qualquer horário que não conste na disponibilidade real apurada para aquela data e serviço.
- **FR-013**: O sistema MUST manter disponível, ao longo de toda a conversa, a disponibilidade real apurada, de modo que a assistente não precise reconstruí-la de memória.
- **FR-014**: O sistema MUST confirmar com a cliente a interpretação de horários ambíguos antes de utilizá-los em um agendamento.

**Integridade da agenda (US3)**

- **FR-015**: O sistema MUST validar toda tentativa de agendamento contra o expediente ativo do dia da semana, independentemente da origem da tentativa.
- **FR-016**: O sistema MUST recusar agendamentos em datas bloqueadas.
- **FR-017**: O sistema MUST recusar agendamentos em datas ou horários passados.
- **FR-018**: O sistema MUST recusar agendamentos cuja duração ultrapasse o fim do bloco de expediente.
- **FR-019**: O sistema MUST recusar agendamentos sem nome e sem contato de WhatsApp da cliente.
- **FR-020**: O sistema MUST derivar a duração do compromisso do cadastro do serviço, e não de valor fornecido por quem solicita o agendamento.
- **FR-021**: O sistema MUST recusar agendamentos para serviços sem duração cadastrada.
- **FR-022**: O sistema MUST aplicar as mesmas validações a agendamentos criados pela assistente e a agendamentos criados por qualquer outro caminho.

**Exclusividade do horário (US4)**

- **FR-023**: O sistema MUST garantir que dois compromissos com sobreposição de horário não coexistam na agenda, mesmo sob tentativas simultâneas.
- **FR-024**: O sistema MUST informar à cliente perdedora de uma disputa por horário que o horário foi tomado, oferecendo alternativas.

**Observabilidade**

- **FR-025**: O sistema MUST registrar toda tentativa de agendamento com seu desfecho real, de forma que uma divergência entre o que foi dito à cliente e o que existe na agenda possa ser detectada.

**Antecedência mínima**

- **FR-026**: O sistema MUST recusar agendamentos com menos de [NEEDS CLARIFICATION: qual a antecedência mínima para agendar? Uma cliente pode reservar um horário que começa em 10 minutos?] de antecedência em relação ao horário de início.

### Key Entities

- **Agendamento**: um compromisso reservado na agenda. Identifica a cliente (nome e WhatsApp), o serviço, a data, o horário de início e fim, a duração e a situação atual (pendente ou confirmado).
- **Disponibilidade**: os blocos de expediente do studio por dia da semana. Um mesmo dia pode ter mais de um bloco (por exemplo, manhã e tarde) e cada bloco pode estar ativo ou inativo.
- **Bloqueio**: uma data específica em que não há atendimento, independentemente do expediente normal daquele dia da semana.
- **Serviço**: um item do catálogo do studio, com nome e a duração necessária para executá-lo.
- **Cliente**: a pessoa que agenda. Possui nome, contato de WhatsApp e, quando autenticada, um cadastro associado.
- **Conversa**: o histórico de mensagens trocadas entre a cliente e a assistente, incluindo a disponibilidade que foi apurada durante o atendimento. É persistida e pode ser retomada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das mensagens de confirmação de agendamento correspondem ao estado real da agenda — nenhuma cliente é informada de sucesso sem compromisso gravado, nem de falha com compromisso gravado.
- **SC-002**: Zero compromissos-fantasma: nenhum agendamento existe na agenda sem que a cliente correspondente tenha sido informada dele.
- **SC-003**: 100% dos horários oferecidos pela assistente são agendáveis no momento em que são oferecidos.
- **SC-004**: Zero agendamentos gravados fora do expediente, em datas bloqueadas ou no passado.
- **SC-005**: Zero pares de compromissos com sobreposição de horário na agenda.
- **SC-006**: A cliente conclui um agendamento do início à confirmação sem receber nenhuma mensagem de erro técnico em 95% das tentativas com horário disponível.
- **SC-007**: A Débora não precisa corrigir manualmente nenhum agendamento criado pela assistente ao longo de uma semana de operação.
- **SC-008**: Uma conversa de agendamento com horário definido é concluída em até 5 trocas de mensagem a partir da escolha do serviço.

## Assumptions

- **Fuso horário**: o studio opera em Goiânia-GO e todas as datas e horários apresentados à cliente se referem ao horário local de Goiânia. Adotado como padrão por ser a localização do studio informada no atendimento.
- **Situação inicial do agendamento**: agendamentos criados pela assistente entram como "pendente", mantendo o comportamento atual — a assistente não confirma o compromisso em nome da Débora.
- **Granularidade dos horários**: os horários continuam sendo oferecidos em intervalos de 30 minutos, mantendo o comportamento atual.
- **Canal**: o escopo é o agendamento pela conversa com a assistente no site e os caminhos de criação de agendamento que alimentam a mesma agenda. O agendamento manual feito pela Débora no painel administrativo não muda de comportamento, mas passa a respeitar as mesmas regras de integridade da agenda.
- **Catálogo e expediente**: o cadastro de serviços, a configuração de expediente e os bloqueios já existem e estão corretos. Esta feature não altera como eles são gerenciados.
- **Identificação da cliente**: a cliente pode estar autenticada (e ter nome e contato já conhecidos) ou informar os dados durante a conversa. Ambos os caminhos permanecem válidos.
- **Comportamento sob indisponibilidade da agenda**: se não for possível determinar o resultado real de um agendamento, o sistema trata como falha e informa a cliente, preferindo o não-agendamento a uma confirmação falsa.
- **Escopo da correção**: [NEEDS CLARIFICATION: esta feature cobre apenas o agendamento, ou também a refatoração ampla do restante do código mencionada no pedido original ("arrume todos os códigos errados possíveis, refatora códigos que não funciona")?]
- **Dados já existentes**: [NEEDS CLARIFICATION: o que fazer com os agendamentos-fantasma que já foram criados na agenda por causa deste bug — identificar e remover, identificar e contatar as clientes, ou deixar como está?]
