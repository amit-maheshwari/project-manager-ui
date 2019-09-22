import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {NgbdSortableHeader, SortEvent, compare} from '../sortable.directive';
import {SessionService} from '../session.service';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.sass']
})
export class ViewTaskComponent implements OnInit {

  taskList: any[];

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.getTasksList();
  }

  getTasksList() {
    this.sessionService.getTaskLists().subscribe(x => {
      this.taskList = x;
    });
  }

  onSort({ column, direction }: SortEvent) {

    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting countries
    if (direction === '') {
      this.taskList = this.taskList;
    } else {
      this.taskList = this.taskList.sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

}
