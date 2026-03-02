---
name: authentication
description: Support authentication on app with users
---

# Authentication Skill

## When to use:
This skill is used when you want to add user authentication to your application.

## What it does:
This skill provides the necessary tools and configurations to implement user registration, login, and session management.

## How to use:
To use this skill, you will need to:
- Install the necessary dependencies.
- Configure your application to use the authentication routes and middleware.
- Implement the authentication logic in your application's code.

##  Rules
Use JWT which comes with the api request, which contain encrypt userId.
Check the loggedin user, if the request userId match the data of the userId.

