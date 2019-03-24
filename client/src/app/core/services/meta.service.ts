import { Injectable } from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  private appColor = '#c4c6d5';
  private appImage = '/assets/img/icons/technocracy.png';
  private appTitle = 'Technocracy';
  private appDescription = 'Technocracy is an online forum for technocrats where they share his knowledge with like minded people.';
  private URL = 'https://www.tecknocracy.com';
  private publishedTime = '2018-02-28T07:24:30+01:00';
  private modifiedTime = '2019-01-01T07:24:30+01:00';

  constructor(private title: Title, private meta: Meta) { }

  public setMetaData(config) {
    // Get the description from the config, or use the default App Description
    const description = config.description || this.appDescription;
    // Get the image from the config or use the App Image
    const image = config.image || this.appImage;
    // Get the title from the config and append the App Title, or just use the App Title
    const title = config.title ? `${config.title}-${this.appTitle}` : this.appTitle;
    const url = config.URL || this.URL;
    // Get blog published and update date and time
    const publishedOn = config.publishedOn || this.publishedTime;
    const updatedOn = config.updatedOn || this.modifiedTime;

    // Set the Application Title
    this.title.setTitle(title);
    // Add the Application Meta tags
    const tags = [
      // SEO metadata
      {name: 'description', content: description},
      {name: 'theme-color', content: this.appColor},

      // Twitter metadata
      {name: 'twitter:card', content: 'summary'},
      {name: 'twitter:image', content: image},
      {name: 'twitter:title', content: title},
      {name: 'twitter:description', content: description},
      {name: 'twitter:url', content: url},
      {name: 'twitter:site', content: '@technocracy_in'},

      // Apple metadata
      {name: 'apple-mobile-web-app-capable', content: 'yes'},
      {name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'},
      {name: 'apple-mobile-web-app-title', content: title},
      {name: 'apple-touch-startup-image', content: image},

      // Facebook and others metadata
      {property: 'og:type', content: 'article'},
      {property: 'og:title', content: title },
      {property: 'og:description', content: description },
      {property: 'og:image', content: image },
      {property: 'og:image:alt', content: 'Technocracy'},
      {property: 'og:url', content: url},
      {property: 'og:site_name', content: 'Technocracy'},
      {property: 'fb:app_id', content: '538035956660855'},
      {property: 'article:section', content: 'Guides'},
      {property: 'article:published_time', content: publishedOn},
      {property: 'article:modified_time', content: updatedOn},
      {property: 'og:image:width', content: '1264'},
      {property: 'og:image:height', content: '645'}
    ];

    // add meta data into page
    tags.forEach(tag => this.meta.updateTag(tag));

    // adding all blog keywords into  article tag
    if (config.tags) {
      config.tags.forEach(tag => {
        this.meta.addTag({property: 'article:tag', content: tag});
      });
    }
  }

}
