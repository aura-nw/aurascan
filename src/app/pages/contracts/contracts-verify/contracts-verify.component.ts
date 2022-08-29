import {AfterViewChecked, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CONTRACT_VERSIONS } from 'src/app/core/constants/contract.constant';
import { IResponsesTemplates } from 'src/app/core/models/common.model';
import { ContractService } from 'src/app/core/services/contract.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { WSService } from 'src/app/core/services/ws.service';

@Component({
  selector: 'app-contracts-verify',
  templateUrl: './contracts-verify.component.html',
  styleUrls: ['./contracts-verify.component.scss'],
})
export class ContractsVerifyComponent implements OnInit, OnDestroy, AfterViewChecked {
  contractAddress = '';
  contractTxHash = '';
  versionList = CONTRACT_VERSIONS;
  @ViewChild('version') versionSelect:any;

  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private wSService: WSService,
    private dlgService: DialogService,
    private toastr: NgxToastrService,
  ) {
    this.contractAddress = this.route.snapshot.paramMap.get('addressId');
    this.contractTxHash = this.route.snapshot.paramMap.get('txHash');

    if (
      this.contractAddress.trim().length === 0 ||
      this.contractTxHash.trim().length === 0
    ) {
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
        wasm_file: new FormControl('', {
          validators: [Validators.required, Validators.maxLength(200)],
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

  onSubmit() {
    this.formControls['link'].markAsTouched();
    this.formControls['compiler_version'].markAsTouched();
    this.formControls['wasm_file'].markAsTouched();

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
        wasm_file: this.contractForm.controls['wasm_file'].value,
      };

      this.contractService.verifyContract(contractData).subscribe((res: IResponsesTemplates<any>) => {
        const data = res?.data;
        if (data) {
          switch (data?.Code) {
            case 'SUCCESSFUL':
              this.dlgServiceOpen();
              this.wSService.subscribeVerifyContract(
                contractData.contract_address,
                () => {
                  this.contractService.loadContractDetail(contractData.contract_address);
                },
                () => {
                  this.router.navigate(['contracts', this.contractAddress], {
                    queryParams: {
                      tabId: 'contract',
                    },
                    state: {
                      reload: true,
                    },
                  });
                },
              );
              break;
            default:
              this.toastr.error(data?.Message);
              break;
          }
        }
      });
    }
  }

  dlgServiceOpen(): void {
    this.dlgService.showDialog({
      content:
        'Contract Source Code Verification is pending!<br>We will notify the compiler output after verification is successful.',
      title: '',
      callback: (e) => {
        if (e) {
          this.router.navigate(['contracts', this.contractAddress], {
            queryParams: {
              tabId: 'contract',
            },
            state: {
              reload: true,
            },
          });
        } else {
          this.handleReset();
        }
      },
    });
  }

  handleReset() {
    this.contractForm.reset({ contract_address: this.contractAddress });
  }

  @HostListener('window:scroll', ['$event']) // for window scroll events
  onScroll(event) {
    this.versionSelect.close();
  }

  ngAfterViewChecked(): void {
  }
}
