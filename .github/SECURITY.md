# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | ✅ Active |
| Latest release | ✅ Active |
| Older releases | ❌ Not supported |

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Email **security@guppy-kit.dev** with:
1. A description of the vulnerability and impact
2. Steps to reproduce
3. Affected versions
4. Any suggested mitigations

You will receive an acknowledgement within **48 hours** and a detailed response within **7 days**.

## Scope

**In scope:**
- Authentication / authorization bypass
- File traversal or arbitrary file access via tool inputs
- Secrets exposure in API responses, tool outputs, or logs
- Remote code execution via tool inputs
- Denial of service in the tool runtime or artifact service

**Out of scope:**
- Issues in unsupported versions
- Social engineering
- Theoretical vulnerabilities without a realistic attack scenario
