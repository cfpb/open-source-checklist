# Open Source Checklist

Automating CFPB's [Open Source Checklist](https://github.com/cfpb/open-source-project-template/blob/master/opensource-checklist.md) for easy release of internal source code.

![](https://raw.githubusercontent.com/cfpb/open-source-checklist/master/screenshot.png)


## Dependencies

- [Node.js](https://nodejs.org/en/)

## Installation

To use [scrub.sh](scrub.sh) to scrub GHE urls:

### Add environment variable

1. Add `.env` and `scrub.sh` to your project's `.gitignore` list.
1. Copy [`.env_SAMPLE`](.env_SAMPLE) to your project's root.
1. Rename `.env_SAMPLE` to `.env`.
1. Edit `fake.ghe.url` to point to the real GHE url (do not include `https://`).
1. `cd` into your project repo root to activate the new environment variable. You should receive a warning and then a confirmation message: 

![](https://raw.githubusercontent.com/cfpb/open-source-checklist/master/screenshot-env.png)

## Usage

1. In Terminal, from project root, run:

  ```bash
./scrub.sh
  ```
![](https://raw.githubusercontent.com/cfpb/open-source-checklist/master/screenshot-scrub-success.png)
1. Force push your repo with tags:

  ```bash
  git push <remote> <branch> -f --tags
  ```
1. Remember to tell your collaborators to clone a fresh copy!

**Note:** If collaborators have branches that they’d like to maintain separately, they will need to fetch and rebase from your updated remote. This must be done via rebase, not merge.

If a collaborator is just mirroring the upstream repo with their fork, they can simply delete their local copy and clone a new one.

### Rebase steps

Only use if you must keep a branch that you're working with locally:

```
git checkout feature-branch
git rebase master
```

## Troubleshooting

If you get the following error when running `scrub.sh`:

> sed: first RE may not be empty

> msg filter failed

You did not activate the environment variable for the GHE url. Make sure you [update the GHE_URL variable and activate it](#add-environment-variable).

## How to test the software

If the software includes automated tests, detail how to run those tests.

## Known issues

Document any known significant shortcomings with the software.

## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.

## Getting involved

This software currently has no tests which means it's certainly broken. Want to write bash scripts, node.js modules, break some git histories and probably some other things? [Contributions welcome!](CONTRIBUTING.md)

----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)


----

## Credits and references

1. Projects that inspired you
2. Related projects
3. Books, papers, talks, or other sources that have meaningful impact or influence on this project
