# Equity Auth is the cross-MFE authentication protocol

The Shell remains the owner of session state, while `equity-auth` is the module that defines and transports cross-MFE authentication state and auth commands for Remote MFEs. We chose this shape so remotes share one seam for auth without taking ownership of login, refresh, or logout behaviour, and because that trade-off is easier to reason about than duplicating session logic per remote.
