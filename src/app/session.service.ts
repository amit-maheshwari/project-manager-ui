import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {HttpParams} from '@angular/common/http';
import {Observable, of, BehaviorSubject} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  showAlert: boolean;
  errorMessage: any;
  successMessage: any;
  showSuccessMessage: boolean;
  private _userList: any = [];
  private _projectList: any = [];
  private _parentTaskList: any = [];
  private _baseUrl: string = "http://localhost:8080/fsd/";

  constructor(private http: HttpClient) {
    this.loadUserList();
    this.loadProjectList();
    this.loadParentTaskList();
  }

  get userList() {
    return this._userList;
  }

  get projectList() {
    return this._projectList;
  }

  updateProjectList(projectList :any){
    this._projectList = projectList;
  }

  get parentTasksList() {
    return this._parentTaskList;
  }

  loadUserList() {
    this.getUsers().subscribe(x => {
      this._userList = x;
    });
  }

  loadProjectList() {
    this.getProjectsList().subscribe(x => {
      this._projectList = x;
    });
  }
  loadParentTaskList() {
    this.getParentTaskLists().subscribe(x => {
      this._parentTaskList = x;
    });
  }

  getUsers(): Observable<any> {
    return this.http.get(this._baseUrl+'users');
  }

  addUser(user: any): Observable<any> {
    console.log(user);
    return this.http.post(this._baseUrl+"users",user).
       pipe(catchError((err )=> {
        return this.handleError(err);
       }));
       }

  updateUser(user: any): Observable<any> {
    console.log(user);
    let url = this._baseUrl+ `users/${user.user_Id}`;
    return this.http.put(url, user).
      pipe(catchError((err )=> {
        return this.handleError(err);
      }));
      }

  deleteUser(user: any) {
    let url = this._baseUrl+`users/${user.user_Id}`;
    return this.http.delete(url);
  }

  addTask(task: any): Observable<any> {
    return this.http.post(this._baseUrl+'tasks',task).
          pipe(catchError((err )=> {
            return this.handleError(err);
          }));
          }

  updateTask(editedTask: any):Observable<any> {
    let url = this._baseUrl+`tasks/${editedTask.task_id}`;
    return this.http.put(url,editedTask);
  }

  searchTask(projectId: any): Observable<any> {
    let url = this._baseUrl+ `tasks/project/${projectId}`;
    return this.http.get(url);
  }

  getProjectsList(): Observable<any> {
    return this.http.get(this._baseUrl+'projects');
  }

  addProject(projects: any): Observable<any> {
    console.log(projects);
    const _this = this;
    return this.http.post(this._baseUrl+"projects", projects).
    pipe(catchError(error => {
     return this.handleError(error);
    }));
  }

  handleError(err){
    this.errorMessage = err && err.error ? err.error: "Something went wrong, please try after sometime !!!";
    this.showAlert = true;
    return of(null);
  }

  updateProject(project: any, projectId :any): Observable<any> {
    console.log(project);
    let url = this._baseUrl+`projects/${projectId}`;
    return this.http.put(url, project).
    pipe(catchError(error => {
      return this.handleError(error);
    }));;
  }

  deleteProject(projectId: any): Observable<any>{
    let url = this._baseUrl+ `projects/${projectId}`;
    return this.http.delete(url);
  }

  getTaskLists(): Observable<any> {
    return this.http.get(this._baseUrl+"tasks");
  }

  getParentTaskLists(): Observable<any> {
    return this.http.get(this._baseUrl+"parentTasks");
  }

  managerSearch(term:any): Observable<any> {
    return this.http.get(this._baseUrl+'users');
  }

  getUserById(userId:any){
    let url = this._baseUrl+`users/${userId}`;
    return this.http.get(url);
  }
}
