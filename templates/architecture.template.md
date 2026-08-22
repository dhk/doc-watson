# Architecture

## System context

```mermaid
flowchart LR
  User[User] --> System[System]
  System --> Dependency[External dependency]
```

[Who uses the system, what it interacts with, and why.]

**So what:** [How this changes the user's situation.]

## Containers

```mermaid
flowchart LR
  A[Container A] --> B[Container B]
```

| Container | Responsibility       |
| --------- | -------------------- |
| A         | [One responsibility] |
| B         | [One responsibility] |

## Key flow

```mermaid
sequenceDiagram
  participant User
  participant System
  User->>System: [Action]
  System-->>User: [Outcome]
```

## Constraints, risks, and unknowns

- [Evidence-backed constraint, risk, or explicit unknown]
