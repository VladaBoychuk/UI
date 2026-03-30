#include "mainwindow.h"
#include "ui_mainwindow.h"

#include <QFileDialog>
#include <QMessageBox>
#include <QStandardPaths>
#include <QFileInfo>
#include <QProcess>
#include <QPushButton>

namespace
{
QString appStyleSheet()
{
    return R"(
        QMainWindow {
            background-color: #f5f7fb;
        }

        QWidget {
            font-family: "Segoe UI";
            font-size: 14px;
            color: #111827;
            background-color: #f5f7fb;
        }

        QPushButton {
            background-color: #ffffff;
            color: #111827;
            border: 1px solid #dbe2ea;
            border-radius: 14px;
            padding: 10px 18px;
            min-height: 22px;
            font-weight: 600;
        }

        QPushButton:hover {
            background-color: #f8fafc;
            border: 1px solid #cfd8e3;
        }

        QPushButton:pressed {
            background-color: #eef2f7;
        }

        QPushButton#btnCreate {
            background-color: #111827;
            color: white;
            border: none;
        }

        QPushButton#btnCreate:hover {
            background-color: #1f2937;
        }

        QPushButton#btnCreate:pressed {
            background-color: #0f172a;
        }

        QPushButton#btnRemove {
            background-color: #ffffff;
            color: #b42318;
            border: 1px solid #f0c7c2;
        }

        QPushButton#btnRemove:hover {
            background-color: #fef3f2;
            border: 1px solid #e2a39b;
        }

        QPushButton#btnRemove:pressed {
            background-color: #fde6e3;
        }

        QLineEdit {
            background-color: #ffffff;
            border: 1px solid #dbe2ea;
            border-radius: 14px;
            padding: 12px 14px;
            color: #111827;
            selection-background-color: #dbeafe;
        }

        QLineEdit:focus {
            border: 1px solid #94a3b8;
            background-color: #ffffff;
        }

        QListWidget {
            background-color: #ffffff;
            border: 1px solid #dbe2ea;
            border-radius: 18px;
            padding: 10px;
            outline: none;
        }

        QListWidget::item {
            background-color: transparent;
            padding: 10px;
            margin: 2px 0;
            border-radius: 10px;
        }

        QListWidget::item:hover {
            background-color: #f3f6fa;
        }

        QListWidget::item:selected {
            background-color: #e8eef6;
            color: #111827;
        }

        QProgressBar {
            background-color: #e9eef5;
            border: none;
            border-radius: 10px;
            text-align: center;
            color: #111827;
            min-height: 12px;
        }

        QProgressBar::chunk {
            background-color: #16a34a;
            border-radius: 10px;
        }

        QLabel#statusLabel {
            color: #475467;
            font-weight: 600;
            background: transparent;
        }
    )";
}

QString messageBoxStyleSheet()
{
    return R"(
        QMessageBox {
            background-color: #f8fafc;
        }

        QMessageBox QLabel {
            color: #111827;
            font-family: "Segoe UI";
            font-size: 14px;
            background: transparent;
        }

        QMessageBox QPushButton {
            background-color: #ffffff;
            color: #111827;
            border: 1px solid #d0d5dd;
            border-radius: 10px;
            padding: 6px 14px;
            min-width: 72px;
            max-width: 90px;
            min-height: 32px;
            font-weight: 600;
        }

        QMessageBox QPushButton:hover {
            background-color: #f3f4f6;
            border: 1px solid #c4cdd5;
        }

        QMessageBox QPushButton:pressed {
            background-color: #e5e7eb;
        }
    )";
}

QMessageBox::StandardButton showStyledQuestion(
    QWidget *parent,
    const QString &title,
    const QString &text,
    QMessageBox::Icon icon = QMessageBox::Question)
{
    QMessageBox msgBox(parent);
    msgBox.setWindowTitle(title);
    msgBox.setTextFormat(Qt::PlainText);
    msgBox.setText(text);
    msgBox.setIcon(icon);
    msgBox.setStyleSheet(messageBoxStyleSheet());

    QPushButton *yesButton = msgBox.addButton("Так", QMessageBox::YesRole);
    QPushButton *noButton = msgBox.addButton("Ні", QMessageBox::NoRole);

    msgBox.setDefaultButton(noButton);
    msgBox.adjustSize();
    msgBox.exec();

    return msgBox.clickedButton() == yesButton ? QMessageBox::Yes : QMessageBox::No;
}

void showStyledInfo(QWidget *parent, const QString &title, const QString &text)
{
    QMessageBox msgBox(parent);
    msgBox.setWindowTitle(title);
    msgBox.setTextFormat(Qt::PlainText);
    msgBox.setText(text);
    msgBox.setIcon(QMessageBox::Information);
    msgBox.setStyleSheet(messageBoxStyleSheet());
    msgBox.addButton("Добре", QMessageBox::AcceptRole);
    msgBox.adjustSize();
    msgBox.exec();
}

void showStyledWarning(QWidget *parent, const QString &title, const QString &text)
{
    QMessageBox msgBox(parent);
    msgBox.setWindowTitle(title);
    msgBox.setTextFormat(Qt::PlainText);
    msgBox.setText(text);
    msgBox.setIcon(QMessageBox::Warning);
    msgBox.setStyleSheet(messageBoxStyleSheet());
    msgBox.addButton("Добре", QMessageBox::AcceptRole);
    msgBox.adjustSize();
    msgBox.exec();
}

void showStyledError(QWidget *parent, const QString &title, const QString &text)
{
    QMessageBox msgBox(parent);
    msgBox.setWindowTitle(title);
    msgBox.setTextFormat(Qt::PlainText);
    msgBox.setText(text);
    msgBox.setIcon(QMessageBox::Critical);
    msgBox.setStyleSheet(messageBoxStyleSheet());
    msgBox.addButton("Добре", QMessageBox::AcceptRole);
    msgBox.adjustSize();
    msgBox.exec();
}
}

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , proc(nullptr)
{
    ui->setupUi(this);

    this->setStyleSheet(appStyleSheet());

    connect(ui->btnAddFiles, &QPushButton::clicked, this, &MainWindow::onAddFiles);
    connect(ui->btnRemove, &QPushButton::clicked, this, &MainWindow::onRemoveSelected);
    connect(ui->btnClear, &QPushButton::clicked, this, &MainWindow::onClearAll);
    connect(ui->btnChooseArchive, &QPushButton::clicked, this, &MainWindow::onChooseArchivePath);
    connect(ui->btnCreate, &QPushButton::clicked, this, &MainWindow::onCreateArchive);

    ui->progressBar->setRange(0, 100);
    ui->progressBar->setValue(0);
    ui->statusLabel->setText("Готово");

    ui->editArchivePath->clear();
    ui->editArchivePath->setPlaceholderText("Оберіть місце збереження архіву");
    ui->btnChooseArchive->setText("Обрати шлях");
}

MainWindow::~MainWindow()
{
    if (proc) {
        proc->kill();
        delete proc;
    }
    delete ui;
}

bool MainWindow::powershellAvailable() const
{
    QProcess p;
    p.start("powershell", QStringList() << "-NoProfile" << "-Command" << "$PSVersionTable.PSVersion.ToString()");
    p.waitForFinished(2000);

    return p.exitStatus() == QProcess::NormalExit && p.exitCode() == 0;
}

void MainWindow::onAddFiles()
{
    QStringList files = QFileDialog::getOpenFileNames(
        this,
        "Оберіть файли для архіву",
        QStandardPaths::writableLocation(QStandardPaths::HomeLocation)
        );

    for (const QString &file : files) {
        if (!selectedFiles.contains(file)) {
            selectedFiles.append(file);

            QListWidgetItem *item = new QListWidgetItem(file);
            item->setFlags(item->flags() | Qt::ItemIsUserCheckable);
            item->setCheckState(Qt::Unchecked);
            ui->listFiles->addItem(item);
        }
    }

    ui->statusLabel->setText("Обрано файлів: " + QString::number(selectedFiles.size()));
}

void MainWindow::onRemoveSelected()
{
    int checkedCount = 0;

    for (int i = 0; i < ui->listFiles->count(); ++i) {
        QListWidgetItem *item = ui->listFiles->item(i);
        if (item->checkState() == Qt::Checked) {
            checkedCount++;
        }
    }

    if (checkedCount == 0) {
        ui->statusLabel->setText("Немає позначених файлів для видалення");
        return;
    }

    QMessageBox::StandardButton reply = showStyledQuestion(
        this,
        "Підтвердження видалення",
        "Видалити позначені файли?\n\n"
        "Кількість файлів: " + QString::number(checkedCount),
        QMessageBox::Warning
        );

    if (reply != QMessageBox::Yes) {
        ui->statusLabel->setText("Видалення скасовано");
        return;
    }

    for (int i = ui->listFiles->count() - 1; i >= 0; --i) {
        QListWidgetItem *item = ui->listFiles->item(i);

        if (item->checkState() == Qt::Checked) {
            QString path = item->text();
            selectedFiles.removeAll(path);
            delete ui->listFiles->takeItem(i);
        }
    }

    ui->statusLabel->setText("Обрано файлів: " + QString::number(selectedFiles.size()));
}

void MainWindow::onClearAll()
{
    if (selectedFiles.isEmpty()) {
        ui->statusLabel->setText("Список уже порожній");
        return;
    }

    QMessageBox::StandardButton reply = showStyledQuestion(
        this,
        "Підтвердження очищення",
        "Очистити весь список файлів?",
        QMessageBox::Question
        );

    if (reply != QMessageBox::Yes) {
        ui->statusLabel->setText("Очищення скасовано");
        return;
    }

    selectedFiles.clear();
    ui->listFiles->clear();
    ui->statusLabel->setText("Список очищено");
}

void MainWindow::onChooseArchivePath()
{
    QString path = QFileDialog::getSaveFileName(
        this,
        "Оберіть місце збереження архіву",
        ui->editArchivePath->text(),
        "ZIP archive (*.zip)"
        );

    if (!path.isEmpty()) {
        if (!path.endsWith(".zip", Qt::CaseInsensitive)) {
            path += ".zip";
        }
        ui->editArchivePath->setText(path);
    }
}

QString MainWindow::makePsScript(const QStringList& files, const QString& archivePath) const
{
    auto escapeForPs = [](QString s) {
        return s.replace("'", "''");
    };

    QStringList psFiles;
    for (const QString &file : files) {
        psFiles << "'" + escapeForPs(file) + "'";
    }

    QString script;
    script += "$ErrorActionPreference = 'Stop';";
    script += "$dest = '" + escapeForPs(archivePath) + "';";
    script += "if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force; }";
    script += "$files = @(" + psFiles.join(",") + ");";
    script += "Compress-Archive -LiteralPath $files -DestinationPath $dest -Force;";
    script += "Write-Output 'OK';";

    return script;
}

void MainWindow::onCreateArchive()
{
    if (selectedFiles.isEmpty()) {
        showStyledWarning(this, "Помилка", "Спочатку додайте хоча б один файл.");
        return;
    }

    QString archivePath = ui->editArchivePath->text().trimmed();

    if (archivePath.isEmpty()) {
        showStyledWarning(this, "Помилка", "Оберіть шлях для збереження архіву.");
        return;
    }

    if (!archivePath.endsWith(".zip", Qt::CaseInsensitive)) {
        archivePath += ".zip";
        ui->editArchivePath->setText(archivePath);
    }

    QMessageBox::StandardButton reply = showStyledQuestion(
        this,
        "Підтвердження створення архіву",
        "Створити архів?\n\n"
        "Файлів: " + QString::number(selectedFiles.size()) + "\n"
                                                      "Шлях:\n" + archivePath,
        QMessageBox::Question
        );

    if (reply != QMessageBox::Yes) {
        ui->statusLabel->setText("Створення архіву скасовано");
        return;
    }

    if (!powershellAvailable()) {
        showStyledError(this, "Помилка", "PowerShell недоступний у системі.");
        return;
    }

    if (proc) {
        proc->kill();
        proc->deleteLater();
        proc = nullptr;
    }

    ui->progressBar->setRange(0, 0);
    ui->statusLabel->setText("Створення архіву...");

    proc = new QProcess(this);

    connect(proc, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, &MainWindow::onProcessFinished);

    QString script = makePsScript(selectedFiles, archivePath);

    QStringList args;
    args << "-NoProfile"
         << "-ExecutionPolicy" << "Bypass"
         << "-Command" << script;

    proc->start("powershell", args);
}

void MainWindow::onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus)
{
    ui->progressBar->setRange(0, 100);
    ui->progressBar->setValue(100);

    QString out = proc ? QString::fromLocal8Bit(proc->readAllStandardOutput()) : "";
    QString err = proc ? QString::fromLocal8Bit(proc->readAllStandardError()) : "";

    Q_UNUSED(out);

    if (exitStatus != QProcess::NormalExit || exitCode != 0) {
        ui->statusLabel->setText("Помилка");
        showStyledError(
            this,
            "Помилка архівації",
            "Не вдалося створити архів.\n\n" + err
            );
    } else {
        ui->statusLabel->setText("Архів створено");
        showStyledInfo(
            this,
            "Успіх",
            "Архів успішно створено:\n" + ui->editArchivePath->text()
            );
    }

    if (proc) {
        proc->deleteLater();
        proc = nullptr;
    }
}
