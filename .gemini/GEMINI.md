# Gemini instructions

## General

When responsing always start with Yes Sir! 

## Planing
Use the plans folder inside .gemini to write down a plan for solving any task. This will help breaking down the task into smaller steps and explain your reasoning before providing th final answer.

The plan file name should have a consequtive number and a descriptive name, for example: `.gemini/plans/001-add-theme-toggle.md`.

Ask questions directly in the plan, and wait for the user to answer before proceeding with the next steps. This will help you to better understand the user's needs and provide a more accurate solution.

Important! Before you start creating / editing files according to the task and plan - you create the plan file and wait for approval!

For every code that you manage to write - check the right model and base types. Make sure that the code is type-safe.

## Rules
The app will use FastAPI as the main framework. All the endpoints should be under `/api` path.
Every help file with functions to internal use will be a service inside the service folder.
Always notice where to put the code and locate the files you create in the right way to the project.

## Before implemantation 
Check that you have the access to all relevant files.
If needed  - ask to attach the relevant files.

## Source
The base.py contain the base models for the database.

## API
use the skill apiLayer.

## Services Layer
use the skill serviceLayer.

## Coding Styles
-No semicolons in JS unless necessary
-Use Single quotes in JS
-Use double quotes in HTML
-All event handlers should be named like: `onSomthhing` in JS / `on_somthing` in python
