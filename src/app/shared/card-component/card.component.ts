// card.component.ts
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { GameModuleModule } from '../../game-module/game-module.module';
import { CutoutService } from '../../../service/service-card';
import { environment } from '../../../environments/environment';
import { LessThanEqualPipe } from '../../shared/less-than-equal.pipe';

export interface Cutout {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-card',
  imports: [GameModuleModule, LessThanEqualPipe],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  providers: [LessThanEqualPipe],
})
export class CardComponent implements OnInit {
  @Input() title = '';
  contentSrc = '';
  frameSrc = '';
  @Input() card;
  @Input() isVisibileText = true;
  @Input() set frameTitle(val) {
    this.frameSrc = environment.frame + val;
    this.getCutOutStyle();
    console.log('frame', this.frameSrc, 'enviromentFrame', environment.frame);
  }
  icons: { src: string; alt: string; value: string }[] = [];
  val = {
    cristal: 'crystal_64x64.png',
    heart: 'heart_64x64.png',
    sword: 'power.png',
  };
  cutoutStyles: { [k: string]: string } | null = null;
  iconStyles: { [k: string]: string } | null = null;
  titleStyles: { [k: string]: string } | null = null;
  constructor(private cutoutSvc: CutoutService) {}
  ngOnInit(): void {
    // const addpath = '/images/card-img/';
    // const addpathart = '/images/card-img/all-card/';

    // const baseOath = environment.assets;
    // const basePathFrame = environment.assets + this.frameTitle;
    const basePathIcon = environment.icon;

    this.contentSrc = environment.allcard + this.card.image;

    console.log();
    if (this.card.type === 'HERO') {
      this.icons = [
        {
          src: basePathIcon + this.val.sword,
          alt: '',
          value: this.card.attack,
        },
        {
          src: basePathIcon + this.val.heart,
          alt: '',
          value: this.card.defense,
        },
        {
          src: basePathIcon + this.val.cristal,
          alt: '',
          value: this.card.cost,
        },
      ];
    } else {
      this.icons = [
        {
          src: basePathIcon + this.val.cristal,
          alt: '',
          value: this.card.cost,
        },
      ];
    }
  }
  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['frameSrc'] && this.frameSrc) {
  //     // resetto prima di ricalcolare

  //     this.cutoutStyles = null;
  //     this.iconStyles = null;
  //     this.cutoutSvc.getCutout(this.frameSrc!).then((c) => {
  //       this.cutoutStyles = {
  //         top: `${c.top}%`,
  //         left: `${c.left}%`,
  //         width: `${c.width}%`,
  //         height: `${c.height}%`,
  //       };

  //       this.iconStyles = {
  //         top: `${c.top + c.height + 3.5}%`,
  //         left: `${c.left}%`,
  //         width: `${c.width}%`,
  //         'justify-content':
  //           this.icons.length === 1 ? 'center' : 'space-around',
  //       };
  //       const center = c.left + c.width / 2;
  //       this.titleStyles = {
  //         top: `calc(${c.top + c.height}% - 2.5em)`,
  //         left: `${center}%`,
  //         transform: 'translateX(-50%)',
  //         width: `${c.width}%`, // ← qui
  //       };
  //     });
  //   }
  // }
  getCutOutStyle() {
    this.cutoutStyles = null;
    this.iconStyles = null;
    this.cutoutSvc.getCutout(this.frameSrc!).then((c) => {
      this.cutoutStyles = {
        top: `${c.top}%`,
        left: `${c.left}%`,
        width: `${c.width}%`,
        height: `${c.height}%`,
      };

      this.iconStyles = {
        top: `${c.top + c.height + 3.5}%`,
        left: `${c.left}%`,
        width: `${c.width}%`,
        'justify-content': this.icons.length === 1 ? 'center' : 'space-around',
      };
      const center = c.left + c.width / 2;
      this.titleStyles = {
        top: `calc(${c.top + c.height}% - 2.5em)`,
        left: `${center}%`,
        transform: 'translateX(-50%)',
        width: `${c.width}%`, // ← qui
      };
    });
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).style.display = 'none';
    ev.stopImmediatePropagation();
  }
}
