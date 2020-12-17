import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-configuration-screen',
  templateUrl: './configuration-screen.component.html',
  styleUrls: ['./configuration-screen.component.scss'],
})
export class ConfigurationScreenComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.creatReactiveForm();
  }

  creatReactiveForm() {
    this.settingsForm = this.fb.group({
      colsX: [8],
      colsY: [8],
      pits: [1],
      arrows: [1],
    });
  }

  ngOnInit(): void {}

  onSubmit() {}
}
