import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from './../../auth/auth.service';
import { ApiService } from './../../core/api.service';
import { UtilsService } from './../../core/utils.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { EventModel } from './../../core/models/event.model';
import { RsvpModel } from './../../core/models/rsvp.model';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit, OnDestroy {
  pageTitle: string;
  id: string;
  routeSub: Subscription;
  tabSub: Subscription;
  eventSub: Subscription;
  event: EventModel;
  rsvps: RsvpModel[] = [];
  loading: boolean;
  error: boolean;
  tab: string;
  eventPast: boolean;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private api: ApiService,
    public utils: UtilsService,
    private title: Title) { }

  ngOnInit() {
    this.tab = 'details';

    // Set event ID from route params and subscribe
    this.routeSub = this.route.params
      .subscribe(params => {
        this.id = params['id'];

        // GET event by ID
        this.eventSub = this.api
          .getEventById$(this.id)
          .subscribe(
            res => {
              this.event = res;
              this._setPageTitle(this.event.title);
              this.loading = false;
              this.eventPast = this.utils.eventPast(this.event.endDatetime);
              console.log(this.event);
            },
            err => {
              console.error(err);
              this.loading = false;
              this.error = true;
              this._setPageTitle('Event Details');
            }
          );
      });

      // Subscribe to query params to watch for tab changes
      this.tabSub = this.route.queryParams
        .subscribe(queryParams => {
          this.tab = queryParams['tab'] || 'details';
        });
  }

  private _setPageTitle(title: string) {
    this.pageTitle = title;
    this.title.setTitle(title);
  }

  get isLoaded() {
    return this.loading === false;
  }

  tabIs(tabName: string) {
    return this.tab === tabName;
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.tabSub.unsubscribe();
    this.eventSub.unsubscribe();
  }

}
