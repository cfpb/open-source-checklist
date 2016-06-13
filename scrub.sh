#!/bin/sh

take_out_trash () {
    rm -rf .git/refs/original/
    git reflog expire --expire=now --all
    git gc --prune=now
    git gc --aggressive --prune=now
}

git_log_output_source=$(git --no-pager log -S$GHE_URL --all; git --no-pager log -G$GHE_URL --all)

if [ "$git_log_output_source" = "" ]; then
    echo "Success! No GHE references found in your source code."
else
    echo "Found GHE references in source code. Scrubbing..."
    git filter-branch --force --tree-filter "find . -type f -exec grep -I -l -q . {} \; -print0 | LC_ALL=C xargs -0 sed -i '' 's/$GHE_URL/fake.ghe.domain/g'" --tag-name-filter cat -- --all
    take_out_trash
fi


git_log_output_commits=$(git --no-pager log --grep=$GHE_URL --all)

edit_commit_messages () {
    git filter-branch -f --msg-filter 'LC_ALL=C sed "s/'$GHE_URL'/fake.ghe.domain/g"' --tag-name-filter cat -- --all
}

confirm_continue () {
    read -r -p "Do you want to continue and edit commit messages? [y/n] " response
    case $response in
        [yY][eE][sS]|[yY]) 
            edit_commit_messages
            take_out_trash
            ;;
        *)
            echo "Goodbye."
            ;;
    esac
}

if [ "$git_log_output_commits" = "" ]; then
    echo "Success! No GHE references found in commit messages."
else
    commit_sha=$(echo $git_log_output_commits | grep -E -o 'commit [0-9a-z]{40}' | cut -d ' ' -f 2)
    commit_count=$(echo $((${#commit_sha} / 40)) )
    echo "Found $commit_count commit messages with GHE references to scrub:"
    echo $commit_sha
    confirm_continue
fi