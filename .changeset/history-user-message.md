---
"mercury": patch
---

Fix conversation history compression dropping the current user message. On a long conversation, the append that crossed the size threshold cleared the whole raw window — including the user's current turn when it was the one that tipped it over. Since the primer and summary leading messages are both assistant-role, the array sent to the model could end up with no user message, which the LLM endpoint rejects ("no user query found in messages"). Compression now retains the trailing run from the last user turn and summarizes only what precedes it, so the current question always survives.
