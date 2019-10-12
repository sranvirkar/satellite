# Poncho Quote & Bind + OSS

## About

#### What

This repo holds the front-end for:

- Poncho Quote & Bind
- Poncho OSS

#### Who

Maintainers:

- Richard Verheyen (React)
- Phil Riley (React)
- Jan Werkhoven (React)
- Boris Bachovski (Salesforce, Apex)
- Ariz Solito (Salesforce, Apex)
- Roberto Oliva (Mulesoft)
- Dinesh Shenoy (Socotra)

#### Tech stack

- React + Webpack ([repo](https://bitbucket.org/stubbie/react_salesforce_satellite/src/develop/))
- Saleforce + Mulesoft + Socotra ([repo](https://bitbucket.org/stubbie/saleforce-m1-9_salesforce_satellite/src/develop/))

## Development

#### Start from scratch

Make sure you have [NVM](https://github.com/nvm-sh/nvm), [Yarn](https://yarnpkg.com/lang/en/) and [Webpack](https://webpack.js.org/) installed:

```
nvm --version
yarn -v
webpack -v
```

Clone the React repo to your local:

```
git clone git@bitbucket.org:stubbie/react_salesforce_satellite.git
cd react_salesforce_satellite
nvm install
yarn install
```

Next, clone the Saleforce repo to a folder called `sfdx` WITHIN the repo above:

```
git clone git@bitbucket.org:stubbie/saleforce-m1-9_salesforce_satellite.git sfdx
```

So you'd have two Git repositories:

1. `react_salesforce_satellite` (React)
2. `react_salesforce_satellite/sfdx` (Saleforce)

Branch React of `develop` and make your own feature branch:

```
git checkout develop
git pull
git checkout -b feature/foo
git push -u origin feature/foo
```

Branch Saleforce of `develop` and make your own feature branch:

```
cd sfdx/
git checkout develop
git pull
git checkout -b feature/bar
git push -u origin feature/bar
```

Next, spin up a Saleforce ScratchOrg:

1. Find your branch `feature/bar` in the [Bitbucket Saleforce repo](https://bitbucket.org/stubbie/saleforce-m1-9_salesforce_satellite/branches/)
2. On the right side, click the ... and choose "Run pipeline"
3. Choose pipeline `create-build-env`, click "Run"
4. A new URL opens up, wait 30min for it to complete
5. Once complete, a new commit was made to your feature branch
6. In `sfdx` do a `git pull`
7. You should see 2 executables were updated
8. Run `./sfdx/dx/login_mac` (may not work in Fish, use Bash instead)
9. Saleforce opens in your browser
10. Home > Left Menu > User Interface > Sites and Domains > Sites > Poncho > Edit > Set URL rewriter class to `PonchoUrlRewriter`
11. Home > Left Menu > Feature Settings > Communities > All Comunities > Poncho > Builder > Publish
12. Home > Left Menu > Feature Settings > Communities > All Comunities > Click the URL
13. Remove `/s` from the end of the URL
14. Page should be blank unless you have the secret cookie set
15. Add `?gofaster=c67f1cfffa8f4dcae7a35cb966438cf4ee94ab63137edb0b2ecdc938488fa0b47812f26736bb93ea` to the URL
16. The landing page should show, you can now remove `?gofaster=...`, it should remember you.
17. Changes to the React app should be reflected here, so remember the URL.

Spin up Webpack

```
cd react_salesforce_satellite
nvm install
yarn install
webpack
```

The first time will take about 5 to 10 minutes to complete. You can see progress
on Salefoce > Deployments (somewhere ...). Once complete:

1. Make changes to codebase
2. Wait 5 - 30 sec for the changes to be uploaded
3. Refresh your browser
4. Changes should show
5. Good luck! :D

#### Boris' intro

```
Pre requisites:
Download and install Node, Git Bash, and NPM on your machine (if you haven’t already done so)
Install the SFDX CLI [run this command in your command prompt/terminal: npm install sfdx-cli --global].
Clone the repository saleforce-m1-9_salesforce_satellite (Front-end: first clone react_salesforce_satellite , then clone saleforce-m1-9_salesforce_satellite inside the /sfdx folder of react_salesforce_satellite).
Front-end only: When you checkout the Salesforce repo, it might create a directory named saleforce-m1-9_salesforce_satellite. Move all the contents from inside this directory (including the hidden git files) to the parent directory sfdx, then delete this directory. This is due to the webpack configuration.
Salesforce (Branching and Scratch Orgs):
Create a feature branch (either from a Jira ticket or from your local machine). Ensure you’re branching off develop . Name your branch feature/FEATURE_YOU_ARE_WORKING_ON.
Go to bitbucket -> branches , find your branch, select Run Pipeline for Branch , select custom: create-build-env .
Git pull on your local machine.
Git checkout YOUR_BRANCH .
Navigate to /DX , run ./login_mac.sh (OS X) or login_win.bat (WIN). If you get an error, try again in a few minutes. Sometimes the server takes a minute or two to propagate the authentication changes. The script will open a new window in your browser and you’ll be logged in to your scratch org.
While you’re in the scratch org, go to Setup and search for Sites . click on the react site and click Edit , select URL Rewriter Class and search/choose ReactUrlRewriter or PonchoUrlRewriter (depending on which site/community you’re working with) .
On the same page, scroll further down in the Site Visualforce Pages section and click Edit. Select and add ChangePassword.
Navigate to Setup -> Communities -> All Communities , click Builder on the react community, then click Publish .
Navigate to Setup -> Communities -> All Communities , click Workspaces on the react community, then click Administration . Click Login & Registration, change the Reset Password dropdown to Visualforce Page and select ChangePassword. Click Save
Front-end (TODO):
The static resource output is in sfdx/DX/force-app/main/default/staticresources . The visualforce page is in sfdx/DX/force-app/main/default/pages .
Once you’re done with the dev work, commit the changes in your branch (saleforce-m1-9_salesforce_satellite) and create a pull request against develop . This will trigger an automatic build pipeline and deploy to the DEV sandbox.
Also commit your changes into the front end branch/repo.
Things to consider:
Docker image currently being used is a public image ncino/ci-sfdx. The libraries required by the pipelines will be dependent on the setup from the owner of the docker image. Below are the key libraries used in by the pipelines:
SFDX
SF Ant Migration tool
Git Bash
Node JS
Recommended approach is to setup a private docker image for Satellite to manage the key libraries especially when there are new library version.
When making changes in the Salesforce code base, call: sfdx force:source:push -f (after the first time just: sfdx force:source:push)
```

## Testing

TBC

## Production

TBC
