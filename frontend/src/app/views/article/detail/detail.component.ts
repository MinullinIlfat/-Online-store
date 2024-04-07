import {Component, OnInit} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {ArticleService} from "../../../shared/services/article.service";
import {ArticleType} from "../../../../types/article.type";
import {ArticlesType} from "../../../../types/articles.type";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentService} from "../../../shared/services/comment.service";
import {CommentsType} from "../../../../types/comments.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActionListType} from "../../../../types/action-list.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  serverStaticPath = environment.serverStaticPath;
  article!: ArticleType;
  relatedArticles: ArticlesType[] = [];
  isLogged: boolean = false;
  comments: CommentsType[] = [];
  commentsCount: number | null = null;
  allCount: number = 0;
  actionsList: ActionListType[] = [];
  svgColorAction: string = 'none';


  constructor(private activatedRoute: ActivatedRoute,
              private articleService: ArticleService,
              private authService: AuthService,
              private commentService: CommentService,
              private _snackBar: MatSnackBar) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.articleService.getArticle(params['url'])
        .subscribe((data: ArticleType) => {
          this.article = data;
          if (this.article.id) {
            this.commentService.getAllCount(this.article.id)
              .subscribe((data) => {
                this.allCount = data.allCount - 3;
                this.commentService.getComments(this.article.id, this.allCount)
                  .subscribe((data) => {
                    this.comments = data.comments;
                    // console.log(this.comments)
                  })
                this.commentService.getActions(this.article.id)
                  .subscribe({
                    next: (data: ActionListType[] | DefaultResponseType) => {
                      this.actionsList = data as ActionListType[];
                      // console.log(this.actionsList)
                    },
                    error: (errorResponse: HttpErrorResponse) => {
                      if (errorResponse.error && errorResponse.error.message) {
                        this._snackBar.open(errorResponse.error.message);
                      } else {
                        this._snackBar.open('Ошибка запроса');
                      }
                    }
                  })
              })
          }
        })
    })

    this.activatedRoute.params.subscribe(params => {
      this.articleService.getRelatedArticle(params['url'])
        .subscribe((data: ArticlesType[]) => {
          this.relatedArticles = data;
        })
    })
  }

  moreComments() {
    if (this.allCount && this.allCount >= 10) {
      this.allCount -= 10;
      this.commentService.getComments(this.article.id, this.allCount)
        .subscribe((data) => {
          this.comments = data.comments;
        })
    } else {
      this.allCount = 0;
      this.commentService.getComments(this.article.id, this.allCount)
        .subscribe((data) => {
          this.comments = data.comments;
        })
    }
  }

  addComment(text: string, id: string) {
    this.commentService.addComment(text, id)
      .subscribe(data => {
        this._snackBar.open(data.message);
      })
  }

  addAction(id: string, action: string) {
    this.commentService.addAction(id, action)
      .subscribe(data => {
        this._snackBar.open('Ваш голос учтен');
      })
  }
}
