// card.component.ts
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GameModuleModule } from '../../game-module/game-module.module';
import { CutoutService } from '../../../service/service-card';
import { environment } from '../../../environments/environment';
import { LessThanEqualPipe } from '../../shared/less-than-equal.pipe';
import { MatDialog } from '@angular/material/dialog';
import { CardZoomDialogComponent } from '../card-zoom-dialog/card-zoom-dialog.component';
import { DoubleTapDirective } from '../../../directive/long-press.directive';
import { CardEffectClassPipe } from '../../../directive/card-effect.pipe';
import { CardEffectHighlightDirective } from '../../../directive/card-effect.directive';

import { NgOptimizedImage } from '@angular/common';
import { CardImageCachePipe } from './img-cash.pipe';

export interface Cutout {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    GameModuleModule,
    LessThanEqualPipe,
    DoubleTapDirective,
    CardEffectClassPipe,
    NgOptimizedImage,
    CardImageCachePipe,
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  providers: [LessThanEqualPipe],
})
export class CardComponent implements OnInit {
  @Input() title = '';
  // contentSrc = '';
  frameSrc = '';
  @ViewChild('frameRef', { static: false })
  frameRef!: ElementRef<HTMLImageElement>;

  frameBorderStyles: {
    position: string;
    top: string;
    left: string;
    width: string;
    height: string;
  } | null = null;

  // assets: 'assets',
  contentSrc = '';
  baseAllCard =
    'https://rrcamyzbvljicmaaqwap.supabase.co/storage/v1/object/public/sw4img/card-img/all-card/';
  basePathIcon =
    'https://rrcamyzbvljicmaaqwap.supabase.co/storage/v1/object/public/sw4img/card-img/icon/';
  frameBase =
    'https://rrcamyzbvljicmaaqwap.supabase.co/storage/v1/object/public/sw4img/card-img/frame/';
  @Input() card;
  @Input() isVisibileText = true;
  @Input() set frameTitle(val) {
    this.frameSrc = this.frameBase + val;
    setTimeout(() => {
      this.getALl();
    }, 20);

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
  constructor(private cutoutSvc: CutoutService, private dialog: MatDialog) {}
  ngOnInit(): void {}

  getALl() {
    this.contentSrc = this.baseAllCard + this.card.image;
    console.log();
    if (this.card.type === 'HERO') {
      this.icons = [
        {
          src: this.basePathIcon + this.val.sword,
          alt: '',
          value: this.card.attack,
        },
        {
          src: this.basePathIcon + this.val.heart,
          alt: '',
          value: this.card.defense,
        },
        {
          src: this.basePathIcon + this.val.cristal,
          alt: '',
          value: this.card.cost,
        },
      ];
    } else {
      this.icons = [
        {
          src: this.basePathIcon + this.val.cristal,
          alt: '',
          value: this.card.cost,
        },
      ];
    }
    this.getCutOutStyle();
    this.getFrameVisibleStyles();
  }
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
  onLongPress() {
    this.dialog.open(CardZoomDialogComponent, {
      data: this.card,
      panelClass: 'card-zoom-dialog',
      backdropClass: 'card-zoom-backdrop',
    });
  }

  private lastTap = 0;

  onDoubleTap() {
    this.onLongPress();
  }
  frameVisibleStyles;
  getFrameVisibleStyles() {
    this.getVisibleFrameBounds(this.frameSrc!).then((bounds) => {
      this.frameBorderStyles = {
        position: 'absolute',
        top: `${bounds.top}%`,
        left: `${bounds.left}%`,
        width: `${bounds.width}%`,
        height: `${bounds.height}%`,
      };
    });
  }

  getVisibleFrameBounds(
    src: string
  ): Promise<{ top: number; left: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // se necessario
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No 2D context');

        ctx.drawImage(img, 0, 0);

        const { data, width, height } = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        let top = height,
          left = width,
          bottom = 0,
          right = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const alpha = data[i + 3];
            if (alpha > 10) {
              // pixel visibile
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }

        const result = {
          top: (top / height) * 100,
          left: (left / width) * 100,
          width: ((right - left) / width) * 100,
          height: ((bottom - top) / height) * 100,
        };

        resolve(result);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
}
