class MyGaia extends Extension {
  constructor() {
    super('MyGaia');
  }

  static info() {
    return {
      id: 'MyGaia',
      title: 'My Gaia',
      description: 'A more modern My Gaia page.',
      author: 'The BetterGaia Team',
      homepage: 'http://www.bettergaia.com/',
      version: '1.0',
      match: ['/mygaia/**']
    };
  }

  static defaultPrefs() {
    return {
      'suggested': true,
      'bgchat': true
    };
  }

  static settings() {
    return [
      {type: 'title', value: 'General'},
      {type: 'checkbox', pref: 'suggested', description: 'Hide suggested content'},
      {type: 'checkbox', pref: 'bgchat', description: 'Stay up to date with BetterGaia'},
    ];
  }

  preMount() {
    this.addStyleSheet('style');

    // Show Suggested Content
    if (this.getPref('suggested') === false)
      this.addCSS('body.mygaia #gaia_content #bd .mg_content.suggested {display: block;}');
  }

  mount() {
    if (this.getPref('bgchat') === true) {
      $('body.mygaia #gaia_content.grid_ray_davies #bd #yui-main .yui-g > .left').prepend(`<div id="bg_sidebar" class="mg_content">
        <div class="mg_sprite hd">BetterGaia <small class="bgversion">${BetterGaia.version}<small>
          <a class="bg_expand"></a>
        </div>
        <div class="bd">
          <iframe sandbox="allow-scripts allow-forms allow-same-origin allow-popups" width="100%" frameborder="0" src="http://www.bettergaia.com/sidebar/"></iframe>
        </div>
      </div>`);

      $('#bg_sidebar .bg_expand').on('click.MyGaia', function() {
        $('#gaia_content .left').toggleClass('bgexpanded');
      });
    }
  }

  unMount() {
    this.removeCSS();
    $('#bg_sidebar .bg_expand').off('click.MyGaia');
    $('#bg_sidebar').remove();
  }
}
