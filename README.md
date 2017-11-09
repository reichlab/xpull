# xpull

Scripts for working with travis-ci.org across github repos.

## Quickstart

For triggering builds from source repository, setup travis API token in source
repository as environment variable `TRAVIS_ACCESS_TOKEN`:

```bash
./trigger.sh <target-repo> <target-script>
```

On the target repo side, setup `xpull.yaml` and install xpull (`npm i -g
reichlab/xpull`). Then run:

```bash
xpull --repo <source-repo> --message <commit-message>
git push
```
