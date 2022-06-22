import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONTRACT_VERSIONS } from 'src/app/core/constants/contract.constant';
import { DialogService } from 'src/app/core/services/dialog.service';
import { WSService } from 'src/app/core/services/ws.service';
import { ContractService } from '../../../core/services/contract.service';

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit, OnDestroy {
  tabCurrent = 0;
  contractAddress = '';
  contractTxHash = '';
  contractName = '';
  isVerified = false;

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);

  TAB = [
    {
      id: 0,
      value: 'Contract Source Code',
    },
    // {
    //   id: 1,
    //   value: 'Compiler Output',
    // },
  ];

  versionList = CONTRACT_VERSIONS;

  constructor(
    private layout: BreakpointObserver,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
    private dlgService: DialogService,
  ) {
    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras) {
      this.contractAddress = this.router.getCurrentNavigation().extras.state.contractAddress;
      this.contractTxHash = this.router.getCurrentNavigation().extras.state.contractTxHash;
      this.contractName = this.router.getCurrentNavigation().extras.state.contractName;
    } else {
      this.router.navigate(['contracts']);
    }
  }

  githubCommitPattern = /https:\/\/github.com\/[\w-\/]+\/commit\/\w+/;

  ngOnDestroy(): void {}

  contractForm: FormGroup;

  get formControls() {
    return this.contractForm.controls;
  }

  ngOnInit(): void {
    this.contractForm = new FormGroup(
      {
        contract_address: new FormControl(
          { value: this.contractAddress, disabled: true },
          { validators: [Validators.required], updateOn: 'submit' },
        ),
        link: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(200), Validators.pattern(this.githubCommitPattern)],
          updateOn: 'submit',
        }),
        url: new FormControl(''),
        compiler_version: new FormControl('', { validators: [Validators.required], updateOn: 'submit' }),
        commit: new FormControl(''),
      },
      {
        updateOn: 'submit',
      },
    );
  }

  changeTab(tabId): void {
    this.tabCurrent = tabId;
  }

  onSubmit() {
    this.formControls['link'].markAsTouched();
    this.formControls['compiler_version'].markAsTouched();
    if (this.contractForm.valid) {
      // handle contract_address & commit
      const link = this.contractForm.controls['link'].value;
      this.contractForm.controls['url'].setValue(link.substring(0, link.indexOf('/commit')));
      this.contractForm.controls['commit'].setValue(link.split('/')[link.split('/').length - 1]);
      const contractData = {
        contract_address: this.contractForm.controls['contract_address'].value,
        url: this.contractForm.controls['url'].value,
        compiler_version: this.contractForm.controls['compiler_version'].value,
        commit: this.contractForm.controls['commit'].value,
      };
      this.contractService.verifyContract(contractData).subscribe((res) => {
        this.socket();
      });
    }
  }

  socket(): void {
    this.wSService.connect();
    const wsData = { event: 'eventVerifyContract' };
    this.wSService.on('register', wsData).subscribe((data: any) => {
      if (this.contractAddress === data?.ContractAddress) {
        this.isVerified = true;
      }
    });

    this.dlgServiceOpen();
  }

  dlgServiceOpen(): void {
    this.dlgService.showDialog({
      content:
        'Contract Source Code Verification is pending!<br>We will notify the compiler output after verification is successful.',
      title: '',
      callback: () => {
        this.router.navigate(['contracts', this.contractAddress]);
      },
    });
  }

  handleReset() {
    this.contractForm.reset({ contract_address: this.contractAddress });
  }
}
