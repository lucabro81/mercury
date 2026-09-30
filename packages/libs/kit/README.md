# @mercury-fw/kit

What a [Mercury](https://github.com/lucabro81/mercury-fw) plugin author imports: the contract a tool plugin implements (`Plugin`, `PLUGIN_API_VERSION` and the types around them) and the one a channel implements (`ChannelPlugin`, `CHANNEL_API_VERSION`), in one place. It carries no runtime, so a plugin that depends on it doesn't pull the framework in.

A proper workflow for writing plugins, with an SDK on top of these contracts, is planned ([#27](https://github.com/lucabro81/mercury-fw/issues/27)).

MIT
