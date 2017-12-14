#!/bin/bash
echo "Standard update to git"
echo "-----------STATUS-----------"
git status
echo "----------------------------"
echo "^ Review git status above  ^"
echo "Type c to continue anything else to exit: "
read cont
if [ "$cont" != "c" ]; then
    echo "No changes made... exiting"
    exit 1
fi
echo "Please enter commit message: "
read message
#echo "Git Password: "
#stty_orig=`stty -g` # save original terminal setting.
#stty -echo          # turn-off echoing.
#read passwd         # read the password
#stty $stty_orig     # restore terminal setting.
echo "-----------ADDING-----------"
git add *
echo "---------COMMITING----------"
git commit -m "$message"
echo "----------PULLING-----------"
git pull
echo "----------PUSHING-----------"
git push
echo "----------FINISHED----------"
exit 1