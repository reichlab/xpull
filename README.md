# xpull

Scripts for pushing/pulling files across github repositories using
[travis-ci.org](https://travis-ci.org/). Common use cases include automatically
copying files from one repo to a set of another. It works by setting up a travis
build on the source repository which triggers builds on target repositories. The
target repositories then use information from a config file `xpull.yaml` to pull
in new files from the source during their own travis builds.

## Scripts

- `trigger.sh` (forked from
  [travis-triggerer](https://github.com/cirocosta/travis-triggerer))

  This is for triggering build in another travis enabled repository. The trigger
  is then used by the _other_ repository to pull in data using information from
  its `xpull.yaml` file. To reduce superflous triggers, you might call this
  conditionally based on whether there are actual changes in the files to be
  copied around. See [this
  file](https://github.com/reichlab/2017-2018-cdc-flu-contest/blob/d724d443c8b4109bad351df84e20efd8d128b8d6/travis-push.sh)
  for an example.

- `xpull`

  This is a node script installable via `npm i -g reichlab/xpull`. When called,
  it looks for a config file `xpull.yaml` (see an example
  [here](https://github.com/reichlab/flusight/blob/604eacfd5eed7e33ac9e59ea32f1d9d6d2c6e207/xpull.yaml)),
  pulls in new files based on the requirements and commits them (doesn't push).
  An example script using this is
  [here](https://github.com/reichlab/flusight/blob/604eacfd5eed7e33ac9e59ea32f1d9d6d2c6e207/travis-xpull.sh#L23-L26)

## Usage

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

## `xpull.yaml`

Target repository describes the files it needs from source in a yaml file like
the following:

```yaml
# xpull config file

transformers:
  csv: |
    f => {
      let splits = path.basename(f).split('-')
      return splits[1] + splits[0].slice(2) + '.csv'
    }
    
reichlab/2017-2018-cdc-flu-contest:
  - ["inst/submissions/kcde-region/*.csv",
     "data/2017-2018/KCDE",
     "csv"]
  - ["inst/submissions/kde-region/*.csv",
     "data/2017-2018/KDE",
     "csv"]
  - ["inst/submissions/sarima_seasonal_difference_FALSE-region/*.csv",
     "data/2017-2018/SARIMA1",
     "csv"]
  - ["inst/submissions/sarima_seasonal_difference_TRUE-region/*.csv",
     "data/2017-2018/SARIMA2",
     "csv"]
  - ["inst/submissions/KoT-region/*.csv",
     "data/2017-2018/Ensemble",
     "csv"]
```

The important section is the project name from which xpull is going to pull
files from. Here it is `reichlab/2017-2018-cdc-flu-contest`. Within a section,
there are a list of _rules_ which are a list of strings like:

- `["<source-glob-pattern>", "<target-destination>"]`
- `["<source-glob-pattern>", "<target-destination>", "<transformer-id>"]`

Transformers are js functions defined in a separate section (see the example)
which are run using [safe-eval](https://github.com/hacksparrow/safe-eval) and
expose only `path` from the set of node features. Defining them is optional.
