import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonIcon } from '@ionic/angular/standalone';
import { SharedIonicModule } from 'src/app/shared/shared-ionic.module';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { AppointmentsStorageService } from 'src/app/services/appointments-storage.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-manage-data',
  templateUrl: './manage-data.page.html',
  styleUrls: ['./manage-data.page.scss'],
  standalone: true,
  imports: [SharedIonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class ManageDataPage implements OnInit {

  constructor(
    private appointmentStorage: AppointmentsStorageService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
  }

  async confirmDeleteAllAppointments() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar TODAS las citas? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-confirm-danger',
          handler: () => {
            this.deleteAllAppointments();
          }
        }
      ],
      cssClass: 'custom-alert',
      backdropDismiss: false
    });

    await alert.present();
  }


  // async confirmDeleteAllAppointments() {
  //   const modal = await this.modalController.create({
  //     component: ConfirmModalComponent,
  //     componentProps: {
  //       title: 'Confirmar eliminación',
  //       message: '¿Eliminar TODAS las citas? Esta acción no se puede deshacer.',
  //       icon: 'warning-outline',
  //       confirmText: 'Eliminar',
  //       confirmColor: 'danger',
  //       cancelText: 'Cancelar'
  //     },
  //     cssClass: 'custom-modal-confirm'
  //   });

  //   await modal.present();

  //   const { data } = await modal.onDidDismiss<{ confirmed: boolean }>();
  //   if (data?.confirmed) {
  //     this.deleteAllAppointments();
  //   }
  // }


  private deleteAllAppointments() {
    this.appointmentStorage.clearAll();
    //Toast
    this.toastController.create({
      message: 'Todas las citas han sido eliminadas.',
      duration: 2000,
      position: 'top',
      positionAnchor: 'header',
      color: 'success',
    }).then((toast) => toast.present());
  }

}
