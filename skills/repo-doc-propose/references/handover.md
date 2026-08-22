# Handover proposal extension

Separate two targets:

- Internal baseline: helps current maintainers work safely; visible unknowns may remain.
- Handover package: enables an independent buyer/operator to build, release, operate, restore, support, and assess risk.

For handover, require evidence or an explicit accepted exclusion for: asset scope; reproducible clean build; tests and release gates; environments and deployment; data ownership, migration, backup, and restore; access and secret transfer; monitoring, incidents, rollback, and recovery; dependency licences/SBOM; source and asset provenance; security disposition; support transition; owner acceptance at a pinned commit.

Do not put credentials or sensitive inventories in Git. Document the secure transfer mechanism and responsible parties.
