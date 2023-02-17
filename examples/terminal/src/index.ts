// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

import '@jupyterlab/application/style/index.css';
import '@jupyterlab/terminal/style/index.css';
import '@jupyterlab/theme-light-extension/style/theme.css';
import '../index.css';

import { DockPanel, Widget } from '@lumino/widgets';

import { TerminalManager } from '@jupyterlab/services';

import { Terminal } from '@jupyterlab/terminal';

async function main(): Promise<void> {
  const dock = new DockPanel({addButtonEnabled:true});
  dock.id = 'main';

  // Attach the widget to the dom.
  Widget.attach(dock, document.body);

  // Handle resize events.
  window.addEventListener('resize', () => {
    dock.fit();
  });

  const manager = new TerminalManager();
  await manager.refreshRunning()
  var terminals = 0
  var iter = manager.running()
  var model = iter.next()
  while(model) {
    const s = await manager.connectTo({model})
    const term = new Terminal(s, { theme: 'dark' });
    if (terminals == 0) {
      term.title.closable = false;
    } else {
      term.title.closable = true;
    }
    dock.addWidget(term);
    terminals += 1
    model = iter.next()
  }

  if (terminals == 0) {
    const s1 = await manager.startNew();
    const term1 = new Terminal(s1, { theme: 'dark' });
    term1.title.closable = false;
    dock.addWidget(term1);
  }

  dock.addRequested.connect(async (sender: DockPanel, arg: any) =>  {
    // Get the ref for the current tab of the tabbar which the add button was clicked
    const s1 = await manager.startNew();
    const term1 = new Terminal(s1, { theme: 'dark' });
    term1.title.closable = true;
    dock.addWidget(term1);
  });
}

window.addEventListener('load', main);
