# Gemini instructions

## General

When responsing always start with Yes Sir! 

## Planing
Use the plan folder to write down a plan for solving any task. This will help breaking down the task into smaller steps and explain your reasoning before providing th final answer.

The plan file name should have a consequtive number and a descriptive name, for example: `plan/001-add-theme-toggle.md`.

Ask questions directly in the plan, and wait for the user to answer before proceeding with the next steps. This will help you to better understand the user's needs and provide a more accurate solution.

For every code that you manage to write - check the right model and base types. Make sure that the code is type-safe.

## Rules
The app will use FastAPI as the main framework. All the endpoints should be under `/api` path.

## API
use the skill apiLayer.

## Services Layer
use the skill serviceLayer.

## Coding Styles
-No semicolons in JS unless necessary
-Use Single quotes in JS
-Use double quotes in HTML
-All event handlers should be named like: `onSomthhing` in JS / `on_somthing` in python
